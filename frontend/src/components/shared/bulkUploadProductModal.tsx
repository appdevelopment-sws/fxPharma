import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { Download, FileSpreadsheet } from "lucide-react"
import { FormContainer } from "@/components/formContainer"
import { Button } from "@/components/ui/button"
import { FormFileUpload } from "@/components/ui/form-fields"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import ProductApi from "@/services/masterProductApi"
import { toast } from "sonner"

interface BulkUploadProductModalProps {
  open: boolean
  onClose: (open: boolean) => void
}

export default function BulkUploadProductModal({
  open,
  onClose,
}: BulkUploadProductModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const queryClient = useQueryClient()
  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      file: null as File | null,
    },
  })

  const selectedFile = watch("file")

  const handleDownloadSample = async () => {
    const toastId = toast.loading("Downloading template...")
    try {
      const blob = await ProductApi.downloadTemplate()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "product_import_template.xlsx")
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success("Template downloaded successfully!", { id: toastId })
    } catch (error) {
      console.error("Error downloading template:", error)
      toast.error("Failed to download template.", { id: toastId })
    }
  }

  const onSubmit = async (data: any) => {
    if (!data.file) return
    setIsUploading(true)
    const toastId = toast.loading("Uploading and importing products...")
    try {
      const res = await ProductApi.bulkImport(data.file)
      
      if (res.success) {
        toast.success(res.message || "Products imported successfully!", { id: toastId })
        queryClient.invalidateQueries({
          queryKey: queryKeys.masterProducts.all,
        })
        onClose(false)
        reset()
      } else {
        toast.error(res.message || "Failed to import products.", { id: toastId })
      }
    } catch (error: any) {
      console.error("Error uploading file:", error)
      const errorMsg = error.response?.data?.message || error.message || "Error importing products."
      toast.error(errorMsg, { id: toastId })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) reset()
        onClose(isOpen)
      }}
      title="Bulk Upload Products"
      description="Upload an Excel or CSV file to bulk add multiple products at once."
      size="md"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onClose(false)
              reset()
            }}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Data"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 pt-2">
        {/* Step 1: Download Template */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <FileSpreadsheet className="size-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">1. Download Template</h4>
                <p className="mt-1 max-w-[250px] text-xs text-muted-foreground">
                  Use our sample excel file as a template to structure your
                  product data correctly.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadSample}>
              <Download className="mr-2 size-4" />
              Download Excel
            </Button>
          </div>
        </div>

        {/* Step 2: Upload Data */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h4 className="text-sm font-semibold">2. Upload Data</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload the prepared template file to import products.
            </p>
          </div>

          <form id="bulk-upload-form" onSubmit={handleSubmit(onSubmit)}>
            <FormFileUpload
              control={control}
              name="file"
              accept=".xlsx, .xls, .csv"
              maxSizeText="Supported formats: XLSX, XLS, CSV (Max 10MB)"
              disabled={isUploading}
            />
          </form>
        </div>
      </div>
    </FormContainer>
  )
}
