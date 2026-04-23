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
  size?: "sm" | "md" | "lg" | "xl" | "full"
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  footer?: React.ReactNode
  children: React.ReactNode
}

const sizeMap = {
  sm: "min-w-md",
  md: "min-w-lg",
  lg: "min-w-2xl",
  xl: "min-w-4xl",
  "2xl": "min-w-5xl",
  full: "min-w-[95vw]",
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
}: FormContainerProps) {
  if (variant === "modal") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className={sizeMap[size]! + " max-h-[90vh] overflow-y-auto"}
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
