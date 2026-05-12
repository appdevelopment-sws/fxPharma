import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useLayoutEffect,
  type PropsWithChildren,
} from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import AuthApi from "@/services/authApi"
import { queryKeys } from "@/lib/queryKeys"

export type AuthUser = {
  id: string
  name: string
  email: string
  organizations: Array<{
    organizationId: string
    status: string
    organization: {
      id: string
      name: string
      slug: string
      branches?: Array<{
        id: string
        name: string
        code: string | null
        isMainBranch?: boolean
      }>
    }
    role: {
      key: string
      name: string
      permissions: Array<{
        permission: {
          key: string
          name: string
        }
      }>
    }
    branches: Array<{
      branch: {
        id: string
        name: string
        code: string
      }
    }>
  }>
  role: string
  permissions: string[]
}

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isSuperAdmin: boolean
  activeOrganizationId: string | null
  activeBranchId: string | null
  switchOrganization: (orgId: string) => void
  switchBranch: (branchId: string | null) => void
  hasRole: (...roles: string[]) => boolean
  hasPermission: (...permissions: string[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient()
  const [activeOrganizationId, setActiveOrganizationId] = useState<
    string | null
  >(localStorage.getItem("activeOrganizationId"))
  const [activeBranchId, setActiveBranchId] = useState<string | null>(
    localStorage.getItem("activeBranchId")
  )

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: AuthApi.getCurrentUser,
    retry: false,
    staleTime: 60_000,
  })

  const rawUser = data?.data ?? null

  // Resolve current active context and flatten permissions
  const user = useMemo(() => {
    if (!rawUser) return null

    // Find active membership or default to the first one
    const activeMembership =
      rawUser.organizations?.find(
        (org: any) => org.organizationId === activeOrganizationId
      ) || rawUser.organizations?.[0]

    // Flatten permission keys from the nested structure
    const permissions =
      activeMembership?.role?.permissions?.map((p: any) => p.permission.key) ||
      []

    return {
      ...rawUser,
      role: activeMembership?.role?.key ?? "",
      permissions,
    } as AuthUser
  }, [rawUser, activeOrganizationId])

  const isSuperAdmin = user?.role === "SUPER_ADMIN"

  const switchOrganization = (orgId: string) => {
    localStorage.setItem("activeOrganizationId", orgId)
    localStorage.removeItem("activeBranchId") // Reset branch when switching org
    setActiveOrganizationId(orgId)
    setActiveBranchId(null)
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() })
  }

  const switchBranch = (branchId: string | null) => {
    if (branchId) {
      localStorage.setItem("activeBranchId", branchId)
    } else {
      localStorage.removeItem("activeBranchId")
    }
    setActiveBranchId(branchId)
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() })
  }

  // Set initial organization if none is selected
  useEffect(() => {
    if (rawUser && !activeOrganizationId && rawUser.organizations?.length > 0) {
      const firstOrgId = rawUser.organizations[0].organizationId
      localStorage.setItem("activeOrganizationId", firstOrgId)
      setActiveOrganizationId(firstOrgId)
    }
  }, [rawUser, activeOrganizationId])

  // Set a default branch for the active organization if none is selected yet.
  useLayoutEffect(() => {
    if (!rawUser || !activeOrganizationId || activeBranchId) return

    const activeMembership =
      rawUser.organizations?.find(
        (org: any) => org.organizationId === activeOrganizationId
      ) || rawUser.organizations?.[0]

    const organizationBranches = activeMembership?.organization?.branches ?? []
    const mainBranch =
      organizationBranches.find((branch: any) => branch.isMainBranch) ||
      organizationBranches[0]

    const firstBranchId =
      activeMembership?.branches?.[0]?.branch?.id ?? mainBranch?.id ?? null

    if (firstBranchId) {
      localStorage.setItem("activeBranchId", firstBranchId)
      setActiveBranchId(firstBranchId)
    }
  }, [rawUser, activeOrganizationId, activeBranchId])

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    isSuperAdmin,
    activeOrganizationId,
    activeBranchId,
    switchOrganization,
    switchBranch,
    hasRole: (...roles) => Boolean(user?.role && roles.includes(user.role)),
    hasPermission: (...permissions) =>
      permissions.every((p) => user?.permissions?.includes(p)),
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
