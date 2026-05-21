import * as React from "react"

import AppDrawer from "@/components/ui/app-drawer"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

type FormContainerProps = {
  variant?: "drawer" | "modal"
  size?: "sm" | "md" | "lg" | "xl" | "full" | "extrafull"
  height?: "sm" | "md" | "lg" | "xl" | "full" | "extrafull"
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
  scrollable?: boolean
}

const sizeMap = {
  sm: "min-w-md",
  md: "min-w-lg",
  lg: "min-w-2xl",
  xl: "min-w-4xl",
  full: "min-w-[95vw]",
  extrafull: "min-w-[100vw]",
}

const heightMap = {
  sm: "max-h-[30vh]",
  md: "max-h-[40vh]",
  lg: "max-h-[50vh]",
  xl: "max-h-[60vh]",
  full: "max-h-[90vh]",
  extrafull: "max-h-[100vh]",
}

export function FormContainer({
  variant = "drawer",
  size = "lg",
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
  height = "full",
  className,
  scrollable = true,
}: FormContainerProps) {
  if (variant === "modal") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className={`${sizeMap[size]!} ${heightMap[height]!} ${
            scrollable ? "overflow-y-auto" : "flex flex-col overflow-hidden p-0 gap-0"
          }`}
        >
          <div className={scrollable ? undefined : "p-6 pb-4 border-b border-border/20 shrink-0 pr-12"}>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
          </div>

          {scrollable ? (
            children
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          )}

          {footer && (
            <div className={scrollable ? undefined : "p-6 border-t border-border/20 shrink-0"}>
              <DialogFooter>{footer}</DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <AppDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="lg"
      footer={footer}
    >
      {children}
    </AppDrawer>
  )
}
