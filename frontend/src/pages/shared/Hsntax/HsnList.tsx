import React from "react"
import { FileText } from "lucide-react"

const HsnList = () => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/10 p-12 text-center animate-in fade-in duration-300">
      <div className="mb-4 rounded-full bg-secondary/10 p-4 text-secondary">
        <FileText className="size-8" />
      </div>
      <h3 className="text-xl font-semibold">HSN Tax List</h3>
      <p className="mx-auto max-w-sm text-muted-foreground">
        Browse and update the master list of HSN codes and their corresponding tax percentages.
      </p>
    </div>
  )
}

export default HsnList
