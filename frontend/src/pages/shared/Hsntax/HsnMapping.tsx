import React from "react"
import { ClipboardList } from "lucide-react"

const HsnMapping = () => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/10 p-12 text-center animate-in fade-in duration-300">
      <div className="mb-4 rounded-full bg-accent/10 p-4 text-accent">
        <ClipboardList className="size-8" />
      </div>
      <h3 className="text-xl font-semibold">HSN Mapping</h3>
      <p className="mx-auto max-w-sm text-muted-foreground">
        Link HSN codes to your product categories or individual products for automated tax calculation.
      </p>
    </div>
  )
}

export default HsnMapping
