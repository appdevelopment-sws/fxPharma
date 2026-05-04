import type { Control, FieldValues, Path } from "react-hook-form"
import { Controller } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type PermissionOption = {
  value: string
  label: string
  description?: string
}

type PermissionMultiSelectFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: Path<T>
  label: string
  options: PermissionOption[]
  description?: string
  selectAllLabel?: string
  readOnly?: boolean
  disabled?: boolean
  error?: string
}

export function PermissionMultiSelectField<T extends FieldValues>({
  control,
  name,
  label,
  options,
  description,
  selectAllLabel = "Select all permissions",
  readOnly,
  disabled,
  error,
}: PermissionMultiSelectFieldProps<T>) {
  const isDisabled = Boolean(disabled || readOnly)

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const selectedValues = Array.isArray(field.value)
          ? (field.value as string[])
          : []
        const selectedCount = selectedValues.length
        const allSelected =
          options.length > 0 &&
          options.every((option) => selectedValues.includes(option.value))
        const someSelected =
          selectedCount > 0 && selectedCount < options.length

        const updateSelection = (nextValues: string[]) => {
          field.onChange(nextValues)
        }

        const toggleValue = (value: string, checked: boolean) => {
          if (checked) {
            updateSelection(Array.from(new Set([...selectedValues, value])))
            return
          }

          updateSelection(selectedValues.filter((item) => item !== value))
        }

        return (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-medium">{label}</Label>
                {description ? (
                  <p className="text-sm text-muted-foreground">{description}</p>
                ) : null}
              </div>
              <Badge variant="outline" className="shrink-0">
                {selectedCount} selected
              </Badge>
            </div>

            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`${String(name)}-all`}
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={(checked) => {
                      if (isDisabled) return
                      updateSelection(
                        checked ? options.map((option) => option.value) : []
                      )
                    }}
                    disabled={isDisabled}
                  />
                  <div>
                    <Label
                      htmlFor={`${String(name)}-all`}
                      className={cn(
                        "cursor-pointer text-sm font-medium",
                        isDisabled && "cursor-not-allowed opacity-60"
                      )}
                    >
                      {selectAllLabel}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Grant every available permission to this account.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isDisabled || selectedCount === 0}
                  onClick={() => updateSelection([])}
                >
                  Clear
                </Button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {options.map((option) => {
                  const checked = selectedValues.includes(option.value)

                  return (
                    <label
                      key={option.value}
                      htmlFor={`${String(name)}-${option.value}`}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border bg-background p-3 transition-colors",
                        checked
                          ? "border-primary/50 bg-primary/5"
                          : "border-border hover:bg-muted/40",
                        isDisabled && "cursor-not-allowed opacity-70"
                      )}
                    >
                      <Checkbox
                        id={`${String(name)}-${option.value}`}
                        checked={checked}
                        disabled={isDisabled}
                        onCheckedChange={(nextChecked) => {
                          if (isDisabled) return
                          toggleValue(option.value, Boolean(nextChecked))
                        }}
                        className="mt-0.5"
                      />
                      <div className="space-y-1">
                        <div className="text-sm font-medium leading-none">
                          {option.label}
                        </div>
                        {option.description ? (
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {option.description}
                          </p>
                        ) : null}
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>
        )
      }}
    />
  )
}
