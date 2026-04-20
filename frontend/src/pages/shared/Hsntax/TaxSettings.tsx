import React from "react"
import { Settings2 } from "lucide-react"

const TaxSettings = () => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/10 p-12 text-center animate-in fade-in duration-300">
      <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
        <Settings2 className="size-8" />
      </div>
      <h3 className="text-xl font-semibold">Tax Settings</h3>
      <p className="mx-auto max-w-sm text-muted-foreground">
        Define GST rates, IGST, CGST, and SGST categories for your products and services.
      </p>
    </div>
  )
}

export default TaxSettings
