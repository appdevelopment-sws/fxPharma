import { FormContainer } from "@/components/formContainer"
import { Button } from "@/components/ui/button"
import { Mail, MessageCircle } from "lucide-react"
import React from "react"

const ShareDialog = ({ open, onClose, order }) => {
  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={(isOpen) => onClose(isOpen)}
      title="Share Order"
      footer={null}
      children={
        <div className="mt-8 flex flex-row items-center justify-center gap-4">
          <Button
            type="button"
            className="h-14 w-1/3 rounded-2xl p-4 text-base font-bold shadow-lg active:scale-[0.98]"
          >
            <MessageCircle className="mr-3 size-6" /> WhatsApp
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-14 w-1/3 rounded-2xl p-4 text-base font-bold shadow-lg active:scale-[0.98]"
          >
            <Mail className="mr-3 size-6" />
            Email
          </Button>
        </div>
      }
    ></FormContainer>
  )
}

export default ShareDialog
