import * as React from "react"
import { ChevronDown, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type FilterBarValues = Record<string, string | number | undefined | null>

type FilterBarContextValue = {
  values: FilterBarValues
  onChange: (updates: Record<string, string>) => void
}

const FilterBarContext = React.createContext<FilterBarContextValue | null>(null)

function useFilterBarContext() {
  const context = React.useContext(FilterBarContext)

  if (!context) {
    throw new Error("FilterBar controls must be used inside FilterBar.")
  }

  return context
}

type FilterBarProps = {
  values: FilterBarValues
  onChange: (updates: Record<string, string>) => void
  children: React.ReactNode
  className?: string
}

type FilterOption = {
  label: string
  value: string
}

type BaseFilterControlProps = {
  name: string
  className?: string
}

type FilterBarSelectProps = BaseFilterControlProps & {
  options: FilterOption[]
  placeholder?: string
}

type FilterBarSearchProps = BaseFilterControlProps & {
  placeholder?: string
}

function FilterBar({
  values,
  onChange,
  children,
  className,
}: FilterBarProps) {
  return (
    <FilterBarContext.Provider value={{ values, onChange }}>
      <div className={cn("flex flex-col gap-3 lg:flex-row lg:flex-wrap", className)}>
        {children}
      </div>
    </FilterBarContext.Provider>
  )
}

function FilterBarSelect({
  name,
  options,
  placeholder = "Select",
  className,
}: FilterBarSelectProps) {
  const { values, onChange } = useFilterBarContext()
  const value = String(values[name] ?? "")

  return (
    <div className={cn("relative min-w-[180px] flex-1", className)}>
      <select
        value={value}
        onChange={(event) => onChange({ [name]: event.target.value })}
        className="h-9 w-full appearance-none rounded-lg border border-input bg-background px-3 pr-9 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}

function FilterBarSearch({
  name,
  placeholder = "Search...",
  className,
}: FilterBarSearchProps) {
  const { values, onChange } = useFilterBarContext()
  const value = String(values[name] ?? "")

  return (
    <div className={cn("relative min-w-[240px] flex-[1.3]", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange({ [name]: event.target.value })}
        placeholder={placeholder}
        className="h-9 pl-9"
      />
    </div>
  )
}

FilterBar.Select = FilterBarSelect
FilterBar.Search = FilterBarSearch

export { FilterBar }
