// src/lib/react-query.ts

import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query"
import { toast } from "sonner"

function getErrorMessage(error: any): string {
  return (
    error?.response?.data?.message || error?.message || "Something went wrong"
  )
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  }),

  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },

    onSuccess: (data: any) => {
      // optional global success
      if (data?.message) {
        toast.success(data.message)
      }
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on specific error codes
        const status = error?.response?.status || error?.code
        if ([401, 403, 404, 422].includes(status)) return false

        // Don't retry on server errors
        if (status >= 500) return false

        // Retry up to 2 times for other errors
        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})
