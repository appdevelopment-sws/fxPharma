import _ from "lodash"
import { useState, useCallback, useMemo } from "react"

export interface FilterData {
  type?: string
  from?: string | null
  to?: string | null
  search?: string
  searchType?: string
  page?: number
  perPage?: number
  [key: string]: any
}

/**
 * Configuration for mapping filter keys to API param names
 * - `paramName`: The API parameter name to use
 * - `skipValues`: Values to skip (e.g., "all" means don't include in params)
 * - `transform`: Optional function to transform the value
 */
export interface FilterParamMapping {
  [filterKey: string]: {
    paramName: string
    skipValues?: (string | number | null | undefined)[]
    transform?: (value: any) => any
  }
}

const defaultData: FilterData = {
  type: "day",
  from: null,
  to: null,
}

/**
 * Build API params from filter state using a mapping configuration
 *
 * @param filter - The current filter state
 * @param mapping - Configuration mapping filter keys to API params
 * @param options - Additional options for building params
 * @returns Record of API params
 */
export function buildFilterParams(
  filter: FilterData,
  mapping: FilterParamMapping = {},
  options: {
    /** Include page and per_page by default */
    includePagination?: boolean
    /** Key in filter that determines search param name (e.g., 'searchType') */
    searchTypeKey?: string
    /** Key in filter that holds the search value */
    searchValueKey?: string
  } = {}
): Record<string, any> {
  const {
    includePagination = true,
    searchTypeKey = "searchType",
    searchValueKey = "search",
  } = options

  const params: Record<string, any> = {}

  // Handle pagination
  if (includePagination) {
    if (filter.page !== undefined) params.page = filter.page
    if (filter.perPage !== undefined) params.per_page = filter.perPage
  }

  // Handle dynamic search type mapping
  const searchType = filter[searchTypeKey]
  const searchValue = filter[searchValueKey]
  if (searchValue && searchType) {
    params[searchType] = searchValue
  }

  // Process mapped filters
  for (const [filterKey, config] of Object.entries(mapping)) {
    const value = filter[filterKey]

    // Skip if value is in skipValues list
    if (config.skipValues?.includes(value)) continue

    // Skip empty/null/undefined values
    if (value === null || value === undefined || value === "") continue

    // Apply transform if provided, otherwise use raw value
    params[config.paramName] = config.transform
      ? config.transform(value)
      : value
  }

  return params
}

export default function useSearchFilter(initalData: FilterData = defaultData) {
  const [filter, setFilter] = useState<FilterData>(initalData)

  const handleFilter = useCallback(
    (data?: Partial<FilterData>) => {
      if (!data) {
        setFilter({
          ...initalData,
        })
      } else {
        // Support both `limit` and `perPage` keys for page size
        const normalized = { ...data } as Partial<FilterData>
        if (
          normalized.limit !== undefined &&
          normalized.perPage === undefined
        ) {
          normalized.perPage = normalized.limit
        }

        setFilter((prev) => ({
          ...prev,
          ...normalized,
        }))
      }
    },
    [initalData]
  )

  const handleFilterBykey = useCallback((key: string, value: any) => {
    setFilter((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  // Memoized debounced handler
  const debouncedHandleFilterByKey = useMemo(
    () =>
      _.debounce((key: string, value: any) => {
        handleFilterBykey(key, value)
      }, 500),
    [handleFilterBykey]
  )

  const handleFilterDebounce = useCallback(
    (value: any) => {
      debouncedHandleFilterByKey("search", value)
    },
    [debouncedHandleFilterByKey]
  )

  /**
   * Build API params using the current filter and a mapping configuration
   */
  const buildParams = useCallback(
    (
      mapping: FilterParamMapping = {},
      options?: Parameters<typeof buildFilterParams>[2]
    ) => {
      return buildFilterParams(filter, mapping, options)
    },
    [filter]
  )

  return {
    filter,
    buildParams,
    handleFilterBykey,
    handleFilter,
    handleFilterDebounce,
  }
}
