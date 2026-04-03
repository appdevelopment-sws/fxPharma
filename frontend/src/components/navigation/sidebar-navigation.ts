import type { LucideIcon } from "lucide-react"
import type { AuthUser } from "@/context/authContext"
import type { PermissionName, RoleName } from "@/lib/access"

export type SidebarNavigationItem = {
  title: string
  to?: string
  description: string
  icon: LucideIcon
  permissions?: PermissionName[]
  roles?: RoleName[]
  children?: SidebarNavigationItem[]
}

export type SidebarNavigationGroup = {
  title: string
  items: SidebarNavigationItem[]
}
// @ts-ignore
export function canAccessNavigationItem(
  item: SidebarNavigationItem,
  user: AuthUser | null
): boolean {
  if (!user) return false

  const matchesRole = !item.roles?.length || item.roles.includes(user.role)
  const matchesPermissions =
    !item.permissions?.length ||
    item.permissions.every((permission) =>
      user.permissions.includes(permission)
    )

  if (!matchesRole || !matchesPermissions) {
    return false
  }

  if (item.children?.length) {
    return item.children.some((child) => canAccessNavigationItem(child, user))
  }

  return true
}

export function getVisibleNavigationGroups(
  groups: SidebarNavigationGroup[],
  user: AuthUser | null
) {
  return groups
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => {
          if (!item.children?.length) return item

          return {
            ...item,
            children: item.children.filter((child) =>
              canAccessNavigationItem(child, user)
            ),
          }
        })
        .filter((item) => canAccessNavigationItem(item, user)),
    }))
    .filter((group) => group.items.length > 0)
}

export function flattenNavigationItems(
  navigationGroups: SidebarNavigationGroup[]
) {
  return navigationGroups.flatMap((group) =>
    group.items.flatMap((item) => [item, ...(item.children ?? [])])
  )
}

export function isNavigationItemActive(
  item: SidebarNavigationItem,
  pathname: string
): boolean {
  const matchesSelf = Boolean(item.to && isRouteMatch(item.to, pathname))
  const matchesChild = item.children?.some((child) =>
    isNavigationItemActive(child, pathname)
  )

  return matchesSelf || Boolean(matchesChild)
}

function isRouteMatch(targetPath: string, pathname: string) {
  if (pathname === targetPath) {
    return true
  }

  if (targetPath === "/") {
    return false
  }

  return pathname.startsWith(`${targetPath}/`)
}
