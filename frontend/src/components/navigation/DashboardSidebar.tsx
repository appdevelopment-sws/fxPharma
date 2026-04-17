import { useState, useEffect, useMemo, type ReactNode } from "react"
import { NavLink } from "react-router"
import { ChevronDown, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  isNavigationItemActive,
  type SidebarNavigationGroup,
  type SidebarNavigationItem,
} from "./sidebar-navigation"

interface DashboardSidebarProps {
  workspaceTitle: string
  workspaceSubtitle: string
  navigationGroups: SidebarNavigationGroup[]
  brandIcon: ReactNode
  isCollapsed: boolean
  activePath: string
  isLoggingOut: boolean
  onLogout: () => void
  onNavigate?: () => void
}

export function DashboardSidebar({
  workspaceTitle,
  workspaceSubtitle,
  navigationGroups,
  brandIcon,
  isCollapsed,
  activePath,
  isLoggingOut,
  onLogout,
  onNavigate,
}: DashboardSidebarProps) {
  const activeParentKeys = useMemo(
    () =>
      navigationGroups.flatMap((group) =>
        group.items
          .filter(
            (item) =>
              item.children?.length && isNavigationItemActive(item, activePath)
          )
          .map((item) => item.title)
      ),
    [activePath, navigationGroups]
  )

  const [expandedItems, setExpandedItems] = useState<string[]>(activeParentKeys)

  useEffect(() => {
    setExpandedItems((current) =>
      Array.from(new Set([...current, ...activeParentKeys]))
    )
  }, [activeParentKeys])

  const toggleExpandedItem = (title: string) => {
    setExpandedItems((current) =>
      current.includes(title)
        ? current.filter((item) => item !== title)
        : [...current, title]
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Brand Section */}
      <div
        className={cn(
          "flex items-center border-b border-white/10 p-6",
          isCollapsed ? "justify-center" : "gap-3"
        )}
      >
        <div className="rounded-x flex size-10 shrink-0 items-center justify-center">
          {brandIcon}
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold tracking-tight">
              {workspaceTitle}
            </h2>
            <p className="truncate text-xs font-medium tracking-widest uppercase">
              {workspaceSubtitle}
            </p>
          </div>
        )}
      </div>

      {/* Navigation section */}
      <nav
        className={cn(
          "scrollbar-thin flex-1 space-y-6 overflow-y-auto px-3 py-1",
          isCollapsed ? "items-center" : ""
        )}
      >
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            {!isCollapsed && (
              <p className="px-4 text-[10px] font-bold tracking-[0.2em] uppercase">
                {group.title}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <SidebarItem
                  key={item.to ?? item.title}
                  item={item}
                  activePath={activePath}
                  isExpanded={expandedItems.includes(item.title)}
                  onToggleExpanded={toggleExpandedItem}
                  onNavigate={onNavigate}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="border-t border-white/10 bg-white/5 p-4">
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "w-full transition-all duration-200 hover:bg-white/10",
            isCollapsed
              ? "h-10 w-10 justify-center p-0"
              : "justify-start gap-3 px-4"
          )}
          onClick={onLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="size-5" />
          {!isCollapsed && (
            <span className="font-medium">
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}

function SidebarItem({
  item,
  activePath,
  isExpanded,
  onToggleExpanded,
  onNavigate,
  isCollapsed,
}: {
  item: SidebarNavigationItem
  activePath: string
  isExpanded: boolean
  onToggleExpanded: (title: string) => void
  onNavigate?: () => void
  isCollapsed: boolean
}) {
  const Icon = item.icon
  const isActive = isNavigationItemActive(item, activePath)
  const hasChildren = !!item.children?.length
  const baseStyles = cn(
    "group flex w-full items-center rounded-sm transition-all duration-300 ease-out",
    isCollapsed ? "mx-auto justify-center p-2" : "gap-2 px-3 py-2",
    (isActive || isExpanded) && "bg-primary/10 text-primary" // 👈 apply bg to main item
  )
  if (hasChildren) {
    return (
      <div className="w-full space-y-1">
        <button
          type="button"
          onClick={() => onToggleExpanded(item.title)}
          className={baseStyles}
        >
          {/* LEFT GROUP */}
          <div className="flex items-center gap-2">
            <Icon className={cn("size-5", isActive ? "text-primary" : "")} />
            {!isCollapsed && (
              <span className="text-sm font-medium whitespace-nowrap">
                {item.title}
              </span>
            )}
          </div>

          {/* RIGHT ICON */}
          {!isCollapsed && (
            <ChevronDown
              className={cn(
                "ml-auto size-4 opacity-50 transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          )}
        </button>
        {!isCollapsed && isExpanded && (
          <div className="mt-1 ml-5 space-y-1 border-l border-white/10 py-1 pl-4">
            {item.children?.map((child) => {
              const childIsActive = isNavigationItemActive(child, activePath)
              return (
                <NavLink
                  key={child.to}
                  to={child.to ?? "#"}
                  onClick={onNavigate}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                    childIsActive ? "text-primary" : " "
                  )}
                >
                  {child.title}
                </NavLink>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink to={item.to ?? "#"} onClick={onNavigate} className={baseStyles}>
      <Icon className={cn("size-5", isActive ? "text-primary" : "")} />
      {!isCollapsed && (
        <span className="truncate text-sm font-medium">{item.title}</span>
      )}
    </NavLink>
  )
}
