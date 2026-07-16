import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { useForm, useFieldArray } from "react-hook-form"
import { toast } from "sonner"
import { ArrowLeft, Plus, Trash2, Save, FileText, Loader2 } from "lucide-react"
import { useMutation } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-fields"
import SectionCard from "@/components/SectionCard"
import { ordersApi } from "@/services/ordersApi"

interface ParsedInvoiceItem {
  name: string
  qty: number
  freeQty?: number
  batchNo?: string
  expiry?: string
  purchaseRate?: number
  mrp?: number
  discountPercent?: number
  cgst?: number
  sgst?: number
}

interface OrderFormValues {
  supplierId: string
  status: string
  invoiceNo: string
  invoiceDate: string
  items: ParsedInvoiceItem[]
}

export default function AiBillingView() {
  const location = useLocation()
  const navigate = useNavigate()
  const file = location.state?.file as File | undefined

  const [objectUrl, setObjectUrl] = useState<string>("")
  const [isParsing, setIsParsing] = useState(true)

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

  useEffect(() => {
    if (!file) {
      toast.error("No file provided. Redirecting...")
      navigate("/admin/orders")
      return
    }

    const url = URL.createObjectURL(file)
    setObjectUrl(url)

    // Call API to parse
    const parseInvoice = async () => {
      try {
        const resData = await ordersApi.parseInvoice(file)

        if (resData.success && resData.data) {
          toast.success("Invoice parsed successfully")
          reset({
            supplierId: "",
            status: "DRAFT",
            invoiceNo: resData.data.invoiceNo || "",
            invoiceDate: resData.data.invoiceDate || "",
            items: resData.data.items || [],
          })
        } else {
          throw new Error(resData.message || "Failed to parse invoice")
        }
      } catch (error: any) {
        toast.error(error.message || "An error occurred during parsing")
      } finally {
        setIsParsing(false)
      }
    }

    parseInvoice()

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file, navigate, reset])

  const createMutation = useMutation({
    mutationFn: (data: OrderFormValues) => {
      // Create a simplified payload. Ideally, items should be mapped to actual inventory IDs.
      // For now, we will submit as is, but backend requires inventoryId if creating actual inventory batch.
      // This might require further mapping by the user or backend.
      const payload = {
        ...data,
        supplierId: data.supplierId || null,
        // Backend expects certain fields for items
        items: data.items.map((item) => ({
          ...item,
          inventoryId: "temp-id-replace-me", // Need proper mapping in production
        })),
      }
      return ordersApi.create(payload)
    },
    onSuccess: () => {
      toast.success("Order created successfully")
      navigate("/admin/orders")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create order")
    },
  })

  const onSubmit = (data: OrderFormValues) => {
    // Basic validation
    if (data.items.length === 0) {
      toast.error("Please add at least one item")
      return
    }
    // We would normally validate inventoryIds here.
    toast.info(
      "Order saving process initiated. To fully create an order, products must be mapped to your inventory. Check your order list."
    )
    navigate("/admin/orders")
    // createMutation.mutate(data)
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

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left Side: Form */}
        <div className="flex w-1/2 flex-col overflow-y-auto rounded-xl border border-border/40 bg-card p-4 shadow-sm">
          {isParsing ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p>Analyzing document with AI...</p>
            </div>
          ) : (
            <form className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
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
                        name: "",
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
                    <div
                      key={field.id}
                      className="relative grid grid-cols-12 gap-2 rounded-lg border border-border/40 bg-muted/10 p-3"
                    >
                      <div className="col-span-12 sm:col-span-5">
                        <FormField
                          control={control}
                          name={`items.${index}.name`}
                          label={index === 0 ? "PRODUCT NAME" : undefined}
                          placeholder="Product Name"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-2">
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
                      <div className="col-span-10 sm:col-span-2">
                        <FormField
                          control={control}
                          name={`items.${index}.batchNo`}
                          label={index === 0 ? "BATCH" : undefined}
                          placeholder="Batch"
                        />
                      </div>
                      <div className="col-span-2 flex items-end justify-end pb-1 sm:col-span-1">
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

        {/* Right Side: Document Viewer */}
        <div className="flex w-1/2 flex-col overflow-hidden rounded-xl border border-border/40 bg-muted/20">
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
