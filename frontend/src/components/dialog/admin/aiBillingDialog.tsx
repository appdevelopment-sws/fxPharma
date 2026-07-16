import { useState } from "react"
import { toast } from "sonner"
import { UploadCloud } from "lucide-react"
import { useNavigate } from "react-router"

import { FormContainer } from "@/components/formContainer"
import { Button } from "@/components/ui/button"

interface AiBillingDialogProps {
  open: boolean
  onClose: (open: boolean) => void
}

export default function AiBillingDialog({
  open,
  onClose,
}: AiBillingDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const navigate = useNavigate()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (!file) {
      toast.error("Please select a file to upload.")
      return
    }

    onClose(false)
    navigate("/admin/orders/ai-billing", { state: { file } })
  }

  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) setFile(null)
        onClose(isOpen)
      }}
      title="Upload Order Bill"
      description="Upload the order bill to automatically generate an order using AI."
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFile(null)
              onClose(false)
            }}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleUpload} disabled={!file}>
            Upload & Process
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 p-6">
        <UploadCloud className="mb-4 h-10 w-10 text-muted-foreground" />
        <label
          htmlFor="bill-upload"
          className="relative cursor-pointer rounded-md bg-transparent font-medium text-primary focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:outline-none hover:text-primary/80"
        >
          <span>Click to upload</span>
          <input
            id="bill-upload"
            name="bill-upload"
            type="file"
            className="sr-only"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
          />
        </label>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, PNG, JPG up to 10MB
        </p>

        {file && (
          <div className="mt-4 rounded bg-primary/10 p-2 text-center text-sm font-medium break-all text-primary">
            Selected: {file.name}
          </div>
        )}
      </div>
    </FormContainer>
  )
}
