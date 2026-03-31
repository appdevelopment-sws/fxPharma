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
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
