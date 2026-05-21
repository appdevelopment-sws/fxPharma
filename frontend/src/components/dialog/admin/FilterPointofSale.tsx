import { useEffect } from "react"
import { useForm, Controller, type SubmitHandler, type Control, type FieldValues, type Path } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FormContainer } from "@/components/formContainer"
import sectionHeader from "@/components/sectionHeader"
import { cn } from "@/lib/utils"
import {
  STOCK_STATUS_OPTIONS,
  ITEM_TYPE_OPTIONS,
  FORMULATION_OPTIONS,
  MANUFACTURER_FILTER_OPTIONS,
} from "@/constants/page/admin/pos"

interface FilterPointofSaleProps {
  open: boolean
  onClose: (open: boolean) => void
  onFilter: (filters: any) => void
  initialFilters?: any
  manufacturerOptions?: Array<{ label: string; value: string }>
}

export default function FilterPointofSale({
  open,
  onClose,
  onFilter,
  initialFilters,
  manufacturerOptions,
}: FilterPointofSaleProps) {
  const { handleSubmit, control, reset } = useForm({
    defaultValues: initialFilters || {
      stockStatus: "all",
      itemType: "all",
      formulation: [],
      manufacturers: [],
    },
    mode: "onChange",
  })

  useEffect(() => {
    if (open && initialFilters) {
      reset(initialFilters)
    }
  }, [open, initialFilters, reset])

  const onSubmit: SubmitHandler<any> = (data) => {
    onFilter(data)
    onClose(false)
  }

  const handleReset = () => {
    const defaultVals = {
      stockStatus: "all",
      itemType: "all",
      formulation: [],
      manufacturers: [],
    }
    reset(defaultVals)
    onFilter(defaultVals)
    onClose(false)
  }

  const resolvedManufacturerOptions =
    manufacturerOptions && manufacturerOptions.length > 0
      ? manufacturerOptions
      : MANUFACTURER_FILTER_OPTIONS

  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={(isOpen) => onClose(isOpen)}
      title="Advanced Filters"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleReset}>
            Reset Filters
          </Button>
          <Button
            type="submit"
            form="pos-filter-form"

          >
            Apply Filters
          </Button>
        </div>
      }
    >
      <form
        id="pos-filter-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="rounded-xl border p-6">
          {sectionHeader("01", "Stock & Type Filters")}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Stock Status */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase">Stock Status</Label>
              <FormToggleButtonGroup
                control={control}
                name="stockStatus"
                options={STOCK_STATUS_OPTIONS}
              />
            </div>

            {/* Item Type */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase">Item Type</Label>
              <FormToggleButtonGroup
                control={control}
                name="itemType"
                options={ITEM_TYPE_OPTIONS}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-6">
          {sectionHeader("02", "Formulation & Brands")}
          <div className="space-y-8">
            {/* Formulation */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase">Formulation</Label>
              <FormToggleButtonGroup
                control={control}
                name="formulation"
                options={FORMULATION_OPTIONS}
                multiple
              />
            </div>

            {/* Manufacturers */}
            <div className="space-y-4">
              <Label className="text-xs font-bold text-muted-foreground uppercase">Manufacturers</Label>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                {resolvedManufacturerOptions.map((mfg) => (
                  <Controller
                    key={mfg.value}
                    control={control}
                    name="manufacturers"
                    render={({ field }) => {
                      const isChecked = (field.value as string[])?.includes(mfg.value)
                      return (
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`mfg-${mfg.value}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const current = (field.value as string[]) || []
                              if (checked) {
                                field.onChange([...current, mfg.value])
                              } else {
                                field.onChange(current.filter((v) => v !== mfg.value))
                              }
                            }}
                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <Label
                            htmlFor={`mfg-${mfg.value}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {mfg.label}
                          </Label>
                        </div>
                      )
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormContainer>
  )
}

interface FormToggleButtonGroupProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  options: Array<{ label: string; value: string }>
  multiple?: boolean
}

function FormToggleButtonGroup<T extends FieldValues>({
  control,
  name,
  options,
  multiple = false,
}: FormToggleButtonGroupProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isActive = multiple
              ? (field.value as string[])?.includes(option.value)
              : field.value === option.value

            return (
              <Button
                key={option.value}
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "h-10 rounded-lg px-4 font-medium transition-all",
                  isActive
                    ? "border-primary bg-primary/5 text-primary hover:bg-primary/10"
                    : "border-border bg-background text-muted-foreground hover:border-border hover:bg-muted/50"
                )}
                onClick={() => {
                  if (multiple) {
                    const current = (field.value as string[]) || []
                    if (current.includes(option.value)) {
                      field.onChange(current.filter((v) => v !== option.value))
                    } else {
                      field.onChange([...current, option.value])
                    }
                  } else {
                    field.onChange(option.value)
                  }
                }}
              >
                {option.label}
              </Button>
            )
          })}
        </div>
      )}
    />
  )
}
