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
}: FormContainerProps) {
  if (variant === "modal") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className={`${sizeMap[size]!} ${heightMap[height]!} overflow-y-auto`}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {children}

          {footer && <DialogFooter>{footer}</DialogFooter>}
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
