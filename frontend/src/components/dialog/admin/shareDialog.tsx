import { FormContainer } from "@/components/formContainer"
import { Button } from "@/components/ui/button"
import {
  Mail,
  MessageCircle,
  Send,
  Share2,
  type LucideIcon,
} from "lucide-react"
import React from "react"

type ShareDialogOption = {
  title: string
  icon: LucideIcon
  type: "whatsapp" | "email"
}

const defaultShareOptions: ShareDialogOption[] = [
  {
    title: "WhatsApp",
    icon: MessageCircle,
    type: "whatsapp",
  },
  {
    title: "Email",
    icon: Mail,
    type: "email",
  },
]

const ShareDialog = ({
  open,
  onClose,
  order,
  options = defaultShareOptions,
  onShare,
}: {
  open: boolean
  onClose: () => void
  order: any
  options?: ShareDialogOption[]
  onShare?: (type: "whatsapp" | "email") => void
}) => {
  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={onClose}
      title="Share Order"
      footer={null}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Send order details instantly through your preferred channel.
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          {options.map((item) => {
            const Icon = item.icon

            return (
              <Button
                key={item.title}
                type="button"
                variant="ghost"
                onClick={() => {
                  onShare?.(item.type)
                  onClose()
                }}
                className="group h-40 flex-col rounded-3xl border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-muted/40 hover:shadow-xl active:scale-[0.98]"
              >
                <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/10">
                  <Icon className="size-8 text-primary transition-transform duration-300 group-hover:rotate-6" />
                </div>

                <span className="text-base font-semibold">{item.title}</span>
              </Button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 rounded-2xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <Send className="size-4 text-primary" />
          Share the order details and keep them informed.
        </div>
      </div>
    </FormContainer>
  )
}

export default ShareDialog
