"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  onConfirm: () => void
  isLoading?: boolean
  confirmText?: string
  variant?: "default" | "danger"
  confirmationKeyword?: string
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isLoading = false,
  confirmText = "Confirm",
  variant = "default",
  confirmationKeyword,
}) => {
  const [input, setInput] = React.useState("")

  const isMatch = confirmationKeyword ? input === confirmationKeyword : true

  const handleConfirm = () => {
    if (!isMatch) return
    onConfirm()
  }

  React.useEffect(() => {
    if (!open) setInput("")
  }, [open])

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {/* Keyword Confirmation */}
        {confirmationKeyword && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Type <span className="font-semibold">{confirmationKeyword}</span>{" "}
              to confirm
            </p>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Type "${confirmationKeyword}"`}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>

          <Button
            onClick={handleConfirm}
            disabled={!isMatch || isLoading}
            className={
              variant === "danger"
                ? "bg-red-600 text-white hover:bg-red-700"
                : ""
            }
          >
            {isLoading ? "Please wait..." : confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
