// src/lib/react-query.ts

import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query"
import { toast } from "sonner"

function formatValidationErrors(errors: any): string[] {
  if (!errors) return []

  if (typeof errors === "string") {
    return [errors]
  }

  if (Array.isArray(errors)) {
    return errors.flatMap((value) => formatValidationErrors(value))
  }

  if (typeof errors !== "object") {
    return [String(errors)]
  }

  return Object.entries(errors).flatMap(([field, value]) => {
    if (Array.isArray(value)) {
      return value.flatMap((message) => formatValidationErrors(message).map((m) => `${field}: ${m}`))
    }

    if (value && typeof value === "object") {
      return Object.entries(value).flatMap(([nestedField, message]) =>
        formatValidationErrors(message).map(
          (m) => `${field}.${nestedField}: ${m}`
        )
      )
    }

    return [`${field}: ${String(value)}`]
  })
}

function getErrorMessage(error: any): string {
  const responseData = error?.response?.data ?? error?.data ?? error
  const baseMessage =
    responseData?.message || error?.message || "Something went wrong"

  const fieldMessages = formatValidationErrors(responseData?.errors)
  if (!fieldMessages.length) {
    return baseMessage
  }

  return fieldMessages.join(" | ")
}

function showErrorToast(error: any) {
  const responseData = error?.response?.data ?? error?.data ?? error
  const fieldMessages = formatValidationErrors(responseData?.errors)

  if (fieldMessages.length) {
    fieldMessages.forEach((message) => toast.error(message))
    return
  }

  toast.error(getErrorMessage(error))
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      showErrorToast(error)
    },
  }),

  mutationCache: new MutationCache({
    onError: (error) => {
      showErrorToast(error)
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
