import * as React from "react"
import { useForm } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { FormContainer } from "@/components/formContainer"
import { Button } from "@/components/ui/button"
import { FormField, FormSelectField } from "@/components/ui/form-fields"
import { 
  type HsnMappingFormValues, 
  type HsnMapping, 
  HsnApi,
  default as TaxApi 
} from "@/services/taxApi"
import { queryKeys } from "@/lib/queryKeys"

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (values: HsnMappingFormValues) => Promise<void> | void
  isSubmitting?: boolean
  mapping?: HsnMapping | null
}

const DEFAULT_VALUES: HsnMappingFormValues = {
  hsnId: "",
  taxId: "",
  effectiveFrom: new Date().toISOString().split("T")[0],
  effectiveTo: "",
}

export default function HsnMappingDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  mapping,
}: Props) {
  const { control, handleSubmit, reset } = useForm<HsnMappingFormValues>({
    defaultValues: DEFAULT_VALUES,
  })

  const { data: hsnCodes } = useQuery({
    queryKey: queryKeys.hsnCodes.list(),
    queryFn: () => HsnApi.getHsnCodes({ limit: 1000 }),
    enabled: open,
  })

  const { data: taxes } = useQuery({
    queryKey: queryKeys.taxes.list(),
    queryFn: () => TaxApi.getTaxes({ limit: 1000 }),
    enabled: open,
  })

  React.useEffect(() => {
    if (open) {
      if (mapping) {
        reset({
          hsnId: String(mapping.hsnId),
          taxId: String(mapping.taxId),
          effectiveFrom: mapping.effectiveFrom.split("T")[0],
          effectiveTo: mapping.effectiveTo ? mapping.effectiveTo.split("T")[0] : "",
        })
      } else {
        reset(DEFAULT_VALUES)
      }
    }
  }, [open, mapping, reset])

  const footer = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button type="submit" form="mapping-form" disabled={isSubmitting}>
        {mapping ? "Update" : "Link"} HSN to Tax
      </Button>
    </div>
  )

  const hsnOptions = React.useMemo(() => 
    (hsnCodes?.data || []).map(h => ({ label: h.code, value: String(h.id) })),
    [hsnCodes]
  )

  const taxOptions = React.useMemo(() => 
    (taxes?.data || []).map(t => ({ label: `${t.name} (${t.rate}%)`, value: String(t.id) })),
    [taxes]
  )

  return (
    <FormContainer
      variant="modal"
      size="sm"
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title={mapping ? "Edit HSN-Tax Link" : "Link HSN to Tax"}
      description="Define which tax rule applies to an HSN code for a specific period."
      footer={footer}
    >
      <form
        id="mapping-form"
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          handleSubmit(async (values) => {
            await onSubmit(values)
          })()
        }}
      >
        <FormSelectField
          control={control}
          name="hsnId"
          label="HSN Code"
          placeholder="Select HSN Code"
          options={hsnOptions}
          required
        />
        <FormSelectField
          control={control}
          name="taxId"
          label="Tax Rule"
          placeholder="Select Tax Rule"
          options={taxOptions}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="effectiveFrom"
            label="Effective From"
            inputType="date"
            required
          />
          <FormField
            control={control}
            name="effectiveTo"
            label="Effective To"
            inputType="date"
          />
        </div>
      </form>
    </FormContainer>
  )
}
