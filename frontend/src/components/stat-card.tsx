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

const cardVariants = [
  {
    shape1: "bg-blue-500",
    shape2: "bg-blue-400",
    iconBg: "bg-blue-500/15 text-blue-500",
    accent: "from-blue-500/5",
  },
  {
    shape1: "bg-emerald-500",
    shape2: "bg-teal-400",
    iconBg: "bg-emerald-500/15 text-emerald-500",
    accent: "from-emerald-500/5",
  },
  {
    shape1: "bg-violet-500",
    shape2: "bg-purple-400",
    iconBg: "bg-violet-500/15 text-violet-500",
    accent: "from-violet-500/5",
  },
  {
    shape1: "bg-orange-500",
    shape2: "bg-amber-400",
    iconBg: "bg-orange-500/15 text-orange-500",
    accent: "from-orange-500/5",
  },
]

export function StatCard({
  title,
  value,
  helper,
  icon,
  className,
  valueClassName,
}: StatCardProps) {
  const variant = useMemo(() => {
    return cardVariants[Math.floor(Math.random() * cardVariants.length)]
  }, [])

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/40",
        "px-4 py-3 shadow-sm transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      {/* Colorful decorative shapes */}
      <div className="pointer-events-none absolute inset-0">
        {/* Large circle — top right */}
        <div
          className={cn(
            "absolute -top-5 -right-5 h-16 w-16 rounded-full opacity-20",
            variant.shape1
          )}
        />
        {/* Small circle — bottom left */}
        <div
          className={cn(
            "absolute -bottom-3 -left-3 h-10 w-10 rounded-full opacity-15",
            variant.shape2
          )}
        />
        {/* Rotated rectangle — mid right */}
        <div
          className={cn(
            "absolute top-1/2 -right-2 h-8 w-8 -translate-y-1/2 rotate-12 rounded-md opacity-10",
            variant.shape1
          )}
        />
        {/* Subtle gradient wash */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br to-transparent opacity-40",
            variant.accent
          )}
        />
      </div>

      {/* Content */}
      <div className="relative flex items-center justify-between gap-3">
        {/* Left */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <div
            className={cn(
              "text-xl font-bold tracking-tight text-foreground leading-none",
              valueClassName
            )}
          >
            {value}
          </div>

          <div className="text-xs font-medium text-muted-foreground truncate">
            {title}
          </div>

          {helper && (
            <div className="text-[10px] text-muted-foreground/70 truncate">{helper}</div>
          )}
        </div>

        {/* Icon */}
        {icon && (
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              "transition-all duration-300 group-hover:scale-110",
              variant.iconBg
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
