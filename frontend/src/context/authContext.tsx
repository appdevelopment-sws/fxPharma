import {
  createContext,
  useContext,
  type PropsWithChildren,
} from "react"
import { useQuery } from "@tanstack/react-query"
import AuthApi from "@/services/authApi"
import { queryKeys } from "@/lib/queryKeys"
import { ROLES, type PermissionName, type RoleName } from "@/lib/access"

export type AuthUser = {
  id: string
  tenantId: string
  name: string
  email: string
  role: RoleName
  permissions: PermissionName[]
  tenant?: {
    id: string
    name: string
    status: string
  }
  createdAt: string
}

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isSuperAdmin: boolean
  hasRole: (...roles: RoleName[]) => boolean
  hasPermission: (...permissions: PermissionName[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: AuthApi.getCurrentUser,
    retry: false,
    staleTime: 60_000,
  })

  const user = (data?.data ?? null) as AuthUser | null

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    isSuperAdmin: user?.role === ROLES.SUPER_ADMIN,
    hasRole: (...roles) => Boolean(user && roles.includes(user.role)),
    hasPermission: (...permissions) =>
      Boolean(
        user &&
          permissions.every((permission) =>
            user.permissions.includes(permission),
          ),
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
