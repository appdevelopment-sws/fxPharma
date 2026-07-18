import { useEffect, useState, useMemo } from "react"
import { useLocation, useNavigate } from "react-router"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { ArrowLeft, Plus, Trash2, Save, FileText, Loader2 } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { FormField, FormSelectField, FormSearchSelect } from "@/components/ui/form-fields"
import { ordersApi } from "@/services/ordersApi"
import SupplierApi from "@/services/supplierApi"
import InventoryApi, { type InventoryItem } from "@/services/inventoryApi"
import { queryKeys } from "@/lib/queryKeys"

interface Supplier {
  id: string
  companyName: string
}

interface ParsedInvoiceItem {
  inventoryId?: string
  name: string
  qty: number
  freeQty?: number
  batchNo?: string
  expiry?: string
  purchaseRate?: number
  mrp?: number
  discountPercent?: number
  discount?: number
  discount_type?: string
  cgst?: number
  sgst?: number
  hsn?: string
}

interface OrderFormValues {
  supplierId: string
  status: string
  invoiceNo: string
  invoiceDate: string
  items: ParsedInvoiceItem[]
}

function findBestInventoryMatch(invoiceName: string, inventory: InventoryItem[]): InventoryItem | null {
  if (!invoiceName) return null

  const normInvoice = invoiceName.toLowerCase().replace(/[^a-z0-9]/g, " ").trim()
  const invoiceTokens = normInvoice.split(/\s+/).filter(Boolean)

  if (invoiceTokens.length === 0) return null

  let bestMatch: InventoryItem | null = null
  let bestScore = 0

  for (const inv of inventory) {
    if (!inv.name) continue
    const normInv = inv.name.toLowerCase().replace(/[^a-z0-9]/g, " ").trim()

    // 1. Exact match (highest priority)
    if (invoiceName.toLowerCase().trim() === inv.name.toLowerCase().trim()) {
      return inv
    }

    const invTokens = normInv.split(/\s+/).filter(Boolean)
    if (invTokens.length === 0) continue

    // Calculate token overlap
    const intersection = invoiceTokens.filter((t) => invTokens.includes(t))
    const score = intersection.length / Math.max(invoiceTokens.length, invTokens.length)

    // Check if one name is a substring of the other
    let subScore = 0
    if (normInv.includes(normInvoice) || normInvoice.includes(normInv)) {
      subScore = 0.8 // High score for substring match
    }

    const finalScore = Math.max(score, subScore)

    // Threshold for matching (e.g. 0.4 overlap or substring match)
    if (finalScore > bestScore && finalScore >= 0.4) {
      bestScore = finalScore
      bestMatch = inv
    }
  }

  return bestMatch
}

export default function AiBillingView() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const file = location.state?.file as File | undefined

  const [objectUrl] = useState<string>(() => {
    return file ? URL.createObjectURL(file) : ""
  })
  const [isParsing, setIsParsing] = useState(true)
  const [leftWidth, setLeftWidth] = useState(50) // percentage
  const [isDragging, setIsDragging] = useState(false)
  const [productSearch, setProductSearch] = useState("")

  const { data: suppliersData, isLoading: isLoadingSuppliers } = useQuery({
    queryKey: queryKeys.suppliers.all,
    queryFn: () => SupplierApi.getSuppliers(),
  })
  const suppliers = suppliersData?.data || []

  const { data: inventoryData } = useQuery({
    queryKey: queryKeys.inventory.list({ limit: 15 }),
    queryFn: () => InventoryApi.getAll({ limit: 15, status: "CONTINUE" }),
  })

  const { data: searchResultsData, isLoading: isSearchingInventory } = useQuery({
    queryKey: queryKeys.inventory.list({ search: productSearch, limit: 20 }),
    queryFn: () => InventoryApi.getAll({ search: productSearch, limit: 20 }),
    enabled: productSearch.trim().length > 0,
  })

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const container = document.getElementById("ai-billing-container")
      if (!container) return
      const rect = container.getBoundingClientRect()
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100
      setLeftWidth(Math.max(25, Math.min(75, newWidth)))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  const { control, handleSubmit, reset } = useForm<OrderFormValues>({
    defaultValues: {
      supplierId: "",
      status: "DRAFT",
      invoiceNo: "",
      invoiceDate: "",
      items: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const items = useWatch({ control, name: "items" })

  const inventoryOptions = useMemo(() => {
    const list = productSearch.trim().length > 0
      ? searchResultsData?.data || []
      : inventoryData?.data || []
    
    const options = list.map((item: InventoryItem) => {
      const categoryName = typeof item.category === "string"
        ? item.category
        : item.category?.name || ""
      return {
        label: `${item.name} (${item.saltComposition || categoryName || "No salt"})`,
        value: item.id,
      }
    })

    // Merge in selected products to ensure they appear in the select options
    const itemsList = items || []
    itemsList.forEach((item: ParsedInvoiceItem) => {
      if (item.inventoryId && !options.some((opt) => opt.value === item.inventoryId)) {
        options.push({
          label: item.name || "Mapped Product",
          value: item.inventoryId,
        })
      }
    })

    return options
  }, [inventoryData, searchResultsData, productSearch, items])

  useEffect(() => {
    if (!file) {
      toast.error("No file provided. Redirecting...")
      navigate("/admin/orders")
    }
  }, [file, navigate])

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [objectUrl])

  useEffect(() => {
    if (!file) return

    // Call API to parse
    const parseInvoice = async () => {
      try {
        const resData = await ordersApi.parseInvoice(file)

        if (resData.success && resData.data) {
          toast.success("Invoice parsed successfully")
          
          // Pre-fetch inventory to try auto-mapping
          let allInventory: InventoryItem[] = []
          try {
            const allInventoryRes = await InventoryApi.getAll({ limit: 1000 })
            allInventory = allInventoryRes?.data || []
          } catch (err) {
            console.error("Failed to load inventory for auto-mapping", err)
          }

          reset({
            supplierId: "",
            status: "DRAFT",
            invoiceNo: resData.data.invoiceNo || "",
            invoiceDate: resData.data.invoiceDate || "",
            items: (resData.data.items || []).map((item: ParsedInvoiceItem) => {
              const match = findBestInventoryMatch(item.name || "", allInventory)
              
              let discount = 0
              let discount_type = "flat"
              if (item.discountPercent !== undefined && item.discountPercent > 0) {
                discount = item.discountPercent
                discount_type = "percentage"
              } else if (item.discount !== undefined && item.discount > 0) {
                discount = item.discount
                discount_type = item.discount_type || "flat"
              }

              return {
                inventoryId: match ? match.id : "",
                name: item.name || "",
                qty: item.qty || 1,
                purchaseRate: item.purchaseRate || 0,
                batchNo: item.batchNo || "",
                expiry: item.expiry || "",
                hsn: item.hsn || "",
                mrp: item.mrp || (match ? (match.mrp ? Number(match.mrp) : 0) : 0),
                freeQty: item.freeQty || 0,
                cgst: item.cgst || (match ? (match.cgst ? Number(match.cgst) : 0) : 0),
                sgst: item.sgst || (match ? (match.sgst ? Number(match.sgst) : 0) : 0),
                discount,
                discount_type,
              }
            }),
          })
        } else {
          throw new Error(resData.message || "Failed to parse invoice")
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An error occurred during parsing"
        toast.error(message)
      } finally {
        setIsParsing(false)
      }
    }

    parseInvoice()
  }, [file, navigate, reset])

  const createMutation = useMutation({
    mutationFn: (data: OrderFormValues) => {
      const payload = {
        ...data,
        supplierId: data.supplierId || null,
        items: data.items.map((item) => ({
          ...item,
          inventoryId: item.inventoryId,
        })),
      }
      return ordersApi.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
      toast.success("Order created successfully")
      navigate("/admin/orders")
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err?.response?.data?.message || "Failed to create order")
    },
  })

  const onSubmit = (data: OrderFormValues) => {
    if (data.items.length === 0) {
      toast.error("Please add at least one item")
      return
    }
    if (!data.supplierId) {
      toast.error("Please select a supplier")
      return
    }
    const hasUnmapped = data.items.some((item) => !item.inventoryId)
    if (hasUnmapped) {
      toast.error("Please map all products to your inventory before saving")
      return
    }
    createMutation.mutate(data)
  }

  if (!file) return null

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/orders")}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-xl font-bold">AI Billing Verification</h1>
        </div>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isParsing || createMutation.isPending}
          className="gap-2"
        >
          <Save className="size-4" />
          Save as Order
        </Button>
      </div>

      <div
        id="ai-billing-container"
        className="flex flex-1 gap-0 overflow-hidden relative select-none"
        style={{ cursor: isDragging ? "col-resize" : "default" }}
      >
        {/* Left Side: Form */}
        <div
          className="flex flex-col overflow-y-auto overscroll-contain rounded-xl border border-border/40 bg-card p-4 shadow-sm"
          style={{ width: `${leftWidth}%` }}
        >
          {isParsing ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p>Analyzing document with AI...</p>
            </div>
          ) : (
            <form className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={control}
                  name="invoiceNo"
                  label="INVOICE NO"
                  placeholder="e.g. INV-001"
                />
                <FormField
                  control={control}
                  name="invoiceDate"
                  label="INVOICE DATE"
                  placeholder="e.g. DD/MM/YYYY"
                />
                <FormSelectField
                  control={control}
                  name="supplierId"
                  label="SUPPLIER"
                  options={suppliers.map((supplier: Supplier) => ({
                    label: supplier.companyName,
                    value: supplier.id,
                  }))}
                  placeholder={
                    isLoadingSuppliers ? "Loading suppliers..." : "Select supplier"
                  }
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">Extracted Items</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        inventoryId: "",
                        name: "",
                        hsn: "",
                        qty: 1,
                        purchaseRate: 0,
                      })
                    }
                  >
                    <Plus className="mr-2 size-3" />
                    Add Row
                  </Button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start">
                      <div
                        className={`flex-none font-bold text-sm text-muted-foreground w-6 text-center ${
                          index === 0 ? "mt-8" : "mt-3"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 relative grid grid-cols-12 gap-2 rounded-lg border border-border/40 bg-muted/10 p-3">
                        <div className="col-span-12 sm:col-span-3">
                          <FormField
                            control={control}
                            name={`items.${index}.name`}
                            label={index === 0 ? "EXTRACTED NAME" : undefined}
                            placeholder="Product Name"
                          />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                          <FormSearchSelect
                            control={control}
                            name={`items.${index}.inventoryId`}
                            label={index === 0 ? "MAPPED PRODUCT" : undefined}
                            placeholder="Map to Inventory"
                            options={inventoryOptions}
                            onSearch={setProductSearch}
                            loading={isSearchingInventory}
                            required
                          />
                        </div>
                        <div className="col-span-6 sm:col-span-1">
                          <FormField
                            control={control}
                            name={`items.${index}.hsn`}
                            label={index === 0 ? "HSN" : undefined}
                            placeholder="HSN"
                          />
                        </div>
                        <div className="col-span-6 sm:col-span-1">
                          <FormField
                            control={control}
                            name={`items.${index}.qty`}
                            label={index === 0 ? "QTY" : undefined}
                            inputType="number"
                          />
                        </div>
                        <div className="col-span-6 sm:col-span-2">
                          <FormField
                            control={control}
                            name={`items.${index}.purchaseRate`}
                            label={index === 0 ? "RATE" : undefined}
                            inputType="number"
                          />
                        </div>
                        <div className="col-span-6 sm:col-span-1">
                          <FormField
                            control={control}
                            name={`items.${index}.batchNo`}
                            label={index === 0 ? "BATCH" : undefined}
                            placeholder="Batch"
                          />
                        </div>
                        <div className="col-span-12 flex items-end justify-end pb-1 sm:col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                      No items extracted.
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Resizable Divider */}
        <div
          className={`w-3 flex items-center justify-center cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors group relative z-10`}
          onMouseDown={handleMouseDown}
        >
          <div className="w-[2px] h-8 rounded bg-border group-hover:bg-primary group-active:bg-primary group-hover:h-12 transition-all" />
        </div>

        {/* Right Side: Document Viewer */}
        <div
          className="flex flex-col overflow-hidden rounded-xl border border-border/40 bg-muted/20"
          style={{ width: `${100 - leftWidth}%` }}
        >
          <div className="flex items-center gap-2 border-b border-border/40 bg-card p-3 shadow-sm">
            <FileText className="size-4 text-primary" />
            <span className="text-sm font-semibold">{file.name}</span>
          </div>
          <div className="h-full flex-1 p-2">
            {file.type.includes("pdf") ? (
              <object
                data={objectUrl}
                type="application/pdf"
                className="h-full w-full rounded-lg"
              >
                <p>
                  Unable to display PDF.{" "}
                  <a href={objectUrl} target="_blank" rel="noreferrer">
                    Download instead
                  </a>
                </p>
              </object>
            ) : file.type.includes("image") ? (
              <img
                src={objectUrl}
                alt="Invoice"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Preview not available for this file type.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
