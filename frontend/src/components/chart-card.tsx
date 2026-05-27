import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface ChartCardProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  contentClassName?: string
  action?: ReactNode
}

export function ChartCard({
  title,
  description,
  children,
  className,
  contentClassName,
  action,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-2">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className={cn("px-2 pb-3", contentClassName)}>{children}</div>
    </div>
  )
}
