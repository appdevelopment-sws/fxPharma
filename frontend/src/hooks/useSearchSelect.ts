import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

/**
 * A custom hook to manage search-based select options in a centralized way.
 */
export function useSearchSelect(
  queryKey: readonly any[],
  queryFn: (search: string) => Promise<any>,
  transform: (data: any) => Array<{ label: string; value: string }>,
  enabled: boolean = true
) {
  const [search, setSearch] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: [...queryKey, search],
    queryFn: () => queryFn(search),
    enabled: enabled,
  })

  return {
    onSearch: setSearch,
    options: data ? transform(data) : [],
    loading: isLoading,
  }
}
