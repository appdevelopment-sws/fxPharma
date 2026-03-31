// src/features/auth/hooks/useRegister.ts

import { useMutation } from "@tanstack/react-query"
import AuthApi from "@/services/authApi"
import { queryClient } from "@/services/customQueryClient"
import { queryKeys } from "@/lib/queryKeys"

export function useRegister() {
  return useMutation({
    mutationFn: AuthApi.register,

    onSuccess: () => {
      // example: refresh auth-related data
      queryClient.invalidateQueries({
        queryKey: queryKeys.auth.all,
      })
    },
  })
}
