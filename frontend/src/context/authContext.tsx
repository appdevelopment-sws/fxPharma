import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import AuthApi from "@/services/authApi"
import { queryKeys } from "@/lib/queryKeys"

export type AuthUser = {
  [x: string]: any
  tenant: any
  tenantId: string
  id: string
  name: string
  email: string
  role?: string // Resolved role for active scope
  permissions?: string[] // Resolved permissions for active scope
  memberships: Array<{
    role: string
    roleName: string
    level: number
    scopeType: string
    scopeId: string | null
    branchName?: string
  }>
  createdAt: string
}

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isSuperAdmin: boolean
  activeBranchId: string | null
  switchBranch: (branchId: string | null) => void
  hasRole: (...roles: string[]) => boolean
  hasPermission: (...permissions: string[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient()
  const [activeBranchId, setActiveBranchId] = useState<string | null>(
    localStorage.getItem("activeBranchId")
  )

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: AuthApi.getCurrentUser,
    retry: false,
    staleTime: 60_000,
  })

  const user = (data?.data ?? null) as AuthUser | null

  const switchBranch = (branchId: string | null) => {
    if (branchId) {
      localStorage.setItem("activeBranchId", branchId)
    } else {
      localStorage.removeItem("activeBranchId")
    }
    setActiveBranchId(branchId)
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() })
  }

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    isSuperAdmin: user?.memberships?.some((m) => m.level >= 100) ?? false,
    activeBranchId,
    switchBranch,
    hasRole: (...roles) => Boolean(user?.role && roles.includes(user.role)),
    hasPermission: (...permissions) =>
      Boolean(
        user?.permissions &&
        permissions.every((p) => user.permissions?.includes(p))
      ),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}
