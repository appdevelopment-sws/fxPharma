import { cn } from "@/lib/utils"

type StatusVariant = "success" | "warning" | "error" | "info" | "default"

interface StatusBadgeProps {
  status: string
  variant?: StatusVariant
  className?: string
}

// Auto-detect variant based on common status values
const getVariantFromStatus = (status: string): StatusVariant => {
  const lowerStatus = status?.toLowerCase() || ""

  if (
    [
      "active",
      "approved",
      "completed",
      "success",
      "paid",
      "verified",
      "published",
    ].includes(lowerStatus)
  ) {
    return "success"
  }
  if (
    [
      "unverified",
      "unpublished",
      "draft",
      "pending",
      "processing",
      "waiting",
    ].includes(lowerStatus)
  ) {
    return "warning"
  }
  if (
    [
      "failed",
      "rejected",
      "cancelled",
      "error",
      "inactive",
      "archived",
    ].includes(lowerStatus)
  ) {
    return "error"
  }
  if (["info", "new", "updated"].includes(lowerStatus)) {
    return "info"
  }
  return "default"
}

const variantStyles: Record<
  StatusVariant,
  { bg: string; text: string; dot: string }
> = {
  success: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  warning: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  error: {
    bg: "bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
  },
  info: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  default: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const resolvedVariant = variant || getVariantFromStatus(status)
  const styles = variantStyles[resolvedVariant]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        styles.bg,
        styles.text,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", styles.dot)} />
      {status || "Unknown"}
    </span>
  )
}
