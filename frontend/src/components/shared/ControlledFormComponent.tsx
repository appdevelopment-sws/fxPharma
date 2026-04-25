import * as React from "react"
import { type Control, type FieldValues, type Path } from "react-hook-form"
import { FORM_TYPE, type FormType } from "@/constants/shared/form"
import {
  FormField,
  FormSelectField,
  FormTextarea,
  FormCheckbox,
} from "@/components/ui/form-fields"

interface ControlledFormComponentProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  type?: FormType | string
  tooltip?: string
  placeholder?: string
  required?: boolean
  readOnly?: boolean
  disabled?: boolean
  options?: Array<{ label: string; value: string; text?: string; key?: string }>
  action?: React.ReactNode
  rows?: number
}

export default function ControlledFormComponent<T extends FieldValues>({
  control,
  name,
  label,
  type = FORM_TYPE.TEXT,
  tooltip,
  placeholder,
  required,
  readOnly,
  disabled,
  options,
  action,
  rows,
}: ControlledFormComponentProps<T>) {
  // Normalize options for FormSelectField in case `text`/`key` format from Notice examples is used
  const mappedOptions = React.useMemo(() => {
    if (!options) return []
    return options.map((opt) => ({
      label: opt.label || opt.text || "",
      value: opt.value ?? String(opt.key ?? ""),
    }))
  }, [options])

  switch (type) {
    case FORM_TYPE.TEXTAREA:
      return (
        <FormTextarea
          control={control}
          name={name}
          label={label}
          tooltip={tooltip}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          rows={rows || 4}
        />
      )

    case FORM_TYPE.SELECT:
    case FORM_TYPE.RADIO: // Simplified fallback to Select if Radio isn't natively built in ui/form-fields
      return (
        <FormSelectField
          control={control}
          name={name}
          label={label}
          tooltip={tooltip}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          disabled={disabled}
          options={mappedOptions}
          action={action}
        />
      )

    case FORM_TYPE.CHECKBOX:
      return (
        <FormCheckbox
          control={control}
          name={name}
          label={label}
          disabled={disabled || readOnly}
        />
      )

    case FORM_TYPE.NUMBER:
      return (
        <FormField
          control={control}
          name={name}
          label={label}
          tooltip={tooltip}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          inputType="number"
        />
      )

    // Fallback to basic text input
    case FORM_TYPE.TEXT:
    default:
      return (
        <FormField
          control={control}
          name={name}
          label={label}
          tooltip={tooltip}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          inputType={
            type === FORM_TYPE.EMAIL
              ? "email"
              : type === FORM_TYPE.PASSWORD
                ? "password"
                : "text"
          }
        />
      )
  }
}
