import * as React from "react"

type SearchFilterValues = Record<string, string | number | undefined | null>

export default function useSearchFilter<T extends SearchFilterValues>(
  initialFilters: T
) {
  const [filter, setFilter] = React.useState<T>(initialFilters)

  const handleFilter = React.useCallback((updates: Partial<T>) => {
    setFilter((current) => {
      let hasChanges = false

      for (const [key, value] of Object.entries(updates)) {
        if (!Object.is(current[key as keyof T], value)) {
          hasChanges = true
          break
        }
      }

      if (!hasChanges) {
        return current
      }

      return {
        ...current,
        ...updates,
      }
    })
  }, [])

  const resetFilter = React.useCallback(() => {
    setFilter(initialFilters)
  }, [initialFilters])

  return {
    filter,
    handleFilter,
    resetFilter,
  }
}
