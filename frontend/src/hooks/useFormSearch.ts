import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

/**
 * A custom hook to manage multiple search-based selects in a form.
 * 
 * @param configs - Configuration for each search field
 * @returns An object containing the options, loading state, and search handler for each field
 * 
 * @example
 * const searches = useFormSearches({
 *   hsn: { 
 *     queryKey: queryKeys.hsnCodes.all, 
 *     queryFn: (search) => HsnApi.getHsnCodes({ search }),
 *     transform: (res) => res.data.map(i => ({ label: i.code, value: i.id }))
 *   }
 * })
 */
export function useFormSearches<T extends Record<string, any>>(configs: {
  [K in keyof T]: {
    queryKey: any[]
    queryFn: (search: string) => Promise<any>
    transform: (data: any) => Array<{ label: string; value: string }>
    enabled?: boolean
  }
}) {
  const results: any = {}

  // We need to use state for each search field
  // Since we can't call hooks in a loop dynamically if keys change, 
  // but here the keys are static based on the config object passed.
  
  for (const key in configs) {
    const config = configs[key]
    const [search, setSearch] = useState("")

    const { data, isLoading } = useQuery({
      queryKey: [...config.queryKey, search],
      queryFn: () => config.queryFn(search),
      enabled: config.enabled !== false,
    })

    results[key] = {
      search,
      onSearch: setSearch,
      options: data ? config.transform(data) : [],
      isLoading,
    }
  }

  return results as {
    [K in keyof T]: {
      search: string
      onSearch: (val: string) => void
      options: Array<{ label: string; value: string }>
      isLoading: boolean
    }
  }
}
