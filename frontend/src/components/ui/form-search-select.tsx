import * as React from "react"
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form"
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react"
import { debounce } from "lodash"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"

interface FormSearchSelectProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  placeholder?: string
  loading?: boolean
  options: Array<{ label: string; value: string }>
  onSearch: (value: string) => void
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  error?: string
  tooltip?: string
}

export function FormSearchSelect<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Search...",
  loading,
  options,
  onSearch,
  required,
  disabled,
  readOnly,
  error,
}: FormSearchSelectProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const debouncedSearch = React.useMemo(
    () => debounce((value: string) => onSearch(value), 500),
    [onSearch]
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    debouncedSearch(value)
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor={String(name)} className="flex items-center gap-1.5">
              {label}
              {required && <span className="text-destructive">*</span>}
            </Label>
          </div>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                disabled={disabled || readOnly}
                className={cn(
                  "h-8 w-full justify-between rounded-lg px-3 font-normal",
                  !field.value && "text-muted-foreground",
                  readOnly && "bg-muted/30 opacity-90",
                  error && "border-destructive"
                )}
              >
                <span className="truncate">
                  {field.value
                    ? options.find((option) => option.value === field.value)
                        ?.label || field.value
                    : placeholder}
                </span>
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[--radix-popover-trigger-width] p-0"
              align="start"
            >
              <div className="flex flex-col">
                <div className="flex items-center border-b px-3 py-2">
                  <Search className="mr-2 size-4 shrink-0 opacity-50" />
                  <input
                    className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Type to search..."
                    value={searchValue}
                    onChange={handleSearchChange}
                  />
                  {loading && (
                    <Loader2 className="ml-2 size-4 animate-spin opacity-50" />
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1 overscroll-contain">
                  {options.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No results found.
                    </div>
                  ) : (
                    options.map((option) => (
                      <div
                        key={option.value}
                        className={cn(
                          "relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                          field.value === option.value &&
                            "bg-accent text-accent-foreground"
                        )}
                        onClick={() => {
                          field.onChange(option.value)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === option.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {option.label}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}
    />
  )
}
