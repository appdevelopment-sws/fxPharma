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
      title={"Share Order"}
      footer={""}
      children={
        <div className="mt-8 flex flex-row items-center justify-center gap-4">
          <Button
            type="button"
            className="h-14 w-1/3 rounded-2xl bg-emerald-500 p-4 text-base font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-[0.98]"
          >
            <MessageCircle className="mr-3 size-6" /> WhatsApp
          </Button>
          <Button
            type="button"
            className="h-14 w-1/3 rounded-2xl bg-cyan-400 p-4 text-base font-bold shadow-lg shadow-cyan-400/20 hover:bg-cyan-500 active:scale-[0.98]"
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
