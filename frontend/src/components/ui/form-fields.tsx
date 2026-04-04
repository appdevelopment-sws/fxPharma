import * as React from "react"
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form"
import { CircleHelp } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
/**
 * Reusable form field components for react-hook-form
 * Use these components in any form to standardize field rendering
 */

// ============================================================================
// FormField Component
// ============================================================================

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  tooltip?: string
  placeholder?: string
  required?: boolean
  readOnly?: boolean
  inputType?: string
  min?: string
  step?: string
  error?: string
}

/**
 * Generic text/number input field with label
 * @example
 * <FormField
 *   control={control}
 *   name="email"
 *   label="Email Address"
 *   inputType="email"
 *   required
 * />
 */
export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  tooltip,
  placeholder,
  required,
  readOnly,
  inputType,
  min,
  step,
  error,
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="space-y-2">
          <FieldLabel
            htmlFor={String(name)}
            label={label}
            required={required}
            tooltip={tooltip}
          />
          <Input
            id={String(name)}
            {...field}
            type={inputType}
            min={min}
            step={step}
            placeholder={placeholder}
            readOnly={readOnly}
            required={required}
            disabled={readOnly}
            className={cn(
              readOnly && "bg-muted/30 opacity-90",
              error && "border-destructive"
            )}
            aria-invalid={!!error}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
    />
  )
}

// ============================================================================
// FormSelectField Component
// ============================================================================

interface FormSelectFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  tooltip?: string
  options: Array<{ label: string; value: string }>
  disabled?: boolean
  readOnly?: boolean
  error?: string
  placeholder?: string
  required?: boolean
  action?: React.ReactNode
}

/**
 * Generic select/dropdown field
 * @example
 * <FormSelectField
 *   control={control}
 *   name="status"
 *   label="Status"
 *   options={[
 *     { label: "Active", value: "active" },
 *     { label: "Inactive", value: "inactive" },
 *   ]}
 * />
 */
export function FormSelectField<T extends FieldValues>({
  control,
  name,
  label,
  tooltip,
  options,
  disabled,
  readOnly,
  error,
  placeholder,
  required,
  action,
}: FormSelectFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <FieldLabel
              htmlFor={String(name)}
              label={label}
              required={required}
              tooltip={tooltip}
            />
            {action}
          </div>
          <select
            id={String(name)}
            {...field}
            disabled={disabled || readOnly}
            className={cn(
              "h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-100",
              readOnly && "bg-muted/30 opacity-90",
              error && "border-destructive"
            )}
            aria-invalid={!!error}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
    />
  )
}

// ============================================================================
// FormTextarea Component
// ============================================================================

interface FormTextareaProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  tooltip?: string
  placeholder?: string
  readOnly?: boolean
  rows?: number
  error?: string
  required?: boolean
}

/**
 * Generic textarea field
 * @example
 * <FormTextarea
 *   control={control}
 *   name="description"
 *   label="Description"
 *   rows={5}
 *   required
 * />
 */
export function FormTextarea<T extends FieldValues>({
  control,
  name,
  label,
  tooltip,
  placeholder,
  readOnly,
  rows,
  error,
  required,
}: FormTextareaProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="space-y-2">
          <FieldLabel
            htmlFor={String(name)}
            label={label}
            required={required}
            tooltip={tooltip}
          />
          <textarea
            id={String(name)}
            {...field}
            placeholder={placeholder}
            readOnly={readOnly}
            rows={rows}
            disabled={readOnly}
            className={cn(
              "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              readOnly && "cursor-default bg-muted/30 opacity-90",
              error && "border-destructive"
            )}
            aria-invalid={!!error}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
    />
  )
}

// ============================================================================
// FormCheckbox Component (Bonus)
// ============================================================================

interface FormCheckboxProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  error?: string
  disabled?: boolean
}

/**
 * Generic checkbox field
 * @example
 * <FormCheckbox
 *   control={control}
 *   name="agreeToTerms"
 *   label="I agree to the terms and conditions"
 * />
 */
export function FormCheckbox<T extends FieldValues>({
  control,
  name,
  label,
  error,
  disabled,
}: FormCheckboxProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              id={String(name)}
              type="checkbox"
              {...field}
              checked={field.value as boolean}
              disabled={disabled}
              className="h-4 w-4 rounded border border-input"
              aria-invalid={!!error}
            />
            <Label htmlFor={String(name)} className="cursor-pointer">
              {label}
            </Label>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
    />
  )
}

type FieldLabelProps = {
  htmlFor: string
  label: string
  required?: boolean
  tooltip?: string
}

function FieldLabel({ htmlFor, label, required, tooltip }: FieldLabelProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      {tooltip ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex cursor-help text-muted-foreground">
                <CircleHelp className="size-3.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">{tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
    </div>
  )
}
