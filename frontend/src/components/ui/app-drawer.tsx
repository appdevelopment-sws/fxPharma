import * as React from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

type AppDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  direction?: React.ComponentProps<typeof Drawer>["direction"]
  size?: "sm" | "md" | "lg" | "xl"
  contentClassName?: string
  bodyClassName?: string
}

const SIZE_CLASS_MAP = {
  sm: "data-[vaul-drawer-direction=right]:sm:max-w-md",
  md: "data-[vaul-drawer-direction=right]:sm:max-w-xl",
  lg: "data-[vaul-drawer-direction=right]:sm:max-w-2xl",
  xl: "data-[vaul-drawer-direction=right]:sm:max-w-3xl",
} as const

function AppDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  direction = "right",
  size = "xl",
  contentClassName,
  bodyClassName,
}: AppDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction={direction}>
      <DrawerContent
        className={cn(
          "data-[vaul-drawer-direction=right]:w-full",
          SIZE_CLASS_MAP[size],
          contentClassName
        )}
      >
        <DrawerHeader className="border-b border-border/60 bg-background/95 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <DrawerTitle>{title}</DrawerTitle>
              {description ? (
                <DrawerDescription>{description}</DrawerDescription>
              ) : null}
            </div>

            <DrawerClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0"
                aria-label="Close drawer"
              >
                <X className="size-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className={cn("flex-1 overflow-y-auto p-4 sm:p-5", bodyClassName)}>
          {children}
        </div>

        {footer ? (
          <DrawerFooter className="border-t border-border/60 bg-background/95 backdrop-blur-sm">
            {footer}
          </DrawerFooter>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}

export default AppDrawer
