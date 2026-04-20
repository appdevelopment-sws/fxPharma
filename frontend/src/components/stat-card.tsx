import { useMemo, type ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface StatCardProps {
  title: string
  value: ReactNode
  helper?: ReactNode
  icon?: ReactNode
  className?: string
  valueClassName?: string
}

const iconBgVariants = [
  "bg-blue-500/10 text-blue-600",
  "bg-green-500/10 text-green-600",
  "bg-purple-500/10 text-purple-600",
  "bg-orange-500/10 text-orange-600",
  "bg-red-500/10 text-red-600",
  "bg-pink-500/10 text-pink-600",
]

export function StatCard({
  title,
  value,
  helper,
  icon,
  className,
  valueClassName,
}: StatCardProps) {
  const iconColor = useMemo(() => {
    return iconBgVariants[Math.floor(Math.random() * iconBgVariants.length)]
  }, [])

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/40 backdrop-blur-sm",
        "p-5 shadow-sm transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-xl",
        className
      )}
    >
      {/* Subtle Gradient Glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      </div>

      <div className="flex items-start justify-between">
        {/* Left Content */}
        <div className="space-y-1.5">
          <div
            className={cn(
              "text-3xl font-semibold tracking-tight text-foreground",
              valueClassName
            )}
          >
            {value}
          </div>

          <div className="text-sm font-medium text-muted-foreground">
            {title}
          </div>

          {helper && (
            <div className="text-xs text-muted-foreground/80">{helper}</div>
          )}
        </div>

        {/* Icon */}
        {icon && (
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              "transition-all duration-300 group-hover:scale-110",
              iconColor
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
