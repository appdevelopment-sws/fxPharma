// src/lib/react-query.ts

import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query"
import { toast } from "sonner"

function getErrorMessage(error: any): string {
  const responseData = error?.response?.data ?? error?.data ?? error
  const baseMessage =
    responseData?.message || error?.message || "Something went wrong"

  const validationErrors = responseData?.errors
  if (!validationErrors || typeof validationErrors !== "object") {
    return baseMessage
  }

  const fieldMessages = Object.entries(validationErrors)
    .flatMap(([field, value]) => {
      if (Array.isArray(value)) {
        return value.map((message) => `${field}: ${String(message)}`)
      }

      if (value && typeof value === "object") {
        return Object.entries(value).map(
          ([nestedField, message]) => `${field}.${nestedField}: ${String(message)}`
        )
      }

      return [`${field}: ${String(value)}`]
    })
    .filter(Boolean)

  if (!fieldMessages.length) {
    return baseMessage
  }

  return `${baseMessage}. ${fieldMessages.join(" | ")}`
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
