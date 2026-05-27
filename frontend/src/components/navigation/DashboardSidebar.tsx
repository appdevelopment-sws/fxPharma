import { useState, useEffect, useMemo, type ReactNode } from "react"
import { NavLink } from "react-router"
import { ChevronDown, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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
  onNavigate?: (to?: string) => void
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
    setExpandedItems(activeParentKeys)
  }, [activeParentKeys])

  const toggleExpandedItem = (title: string) => {
    setExpandedItems((current) => (current.includes(title) ? [] : [title]))
  }

  return (
    <div className="relative flex h-full flex-col overflow-visible bg-[#2563EB] text-white">
      {/* BRAND */}
      <div
        className={cn(
          "flex items-center border-b border-white/10 p-6",
          isCollapsed ? "justify-center" : "gap-3"
        )}
      >
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10">
          <img
            src={workspaceSubtitle || "/logo.png"}
            alt={workspaceTitle}
            className="h-full w-full object-cover"
          />
        </div>

        {!isCollapsed && (
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold tracking-tight text-white">
              {workspaceTitle}
            </h2>
          </div>
        )}
      </div>

      {/* NAVIGATION */}
      <nav
        className={cn(
          "no-scrollbar flex-1 overflow-x-visible overflow-y-auto px-3 py-4",
          isCollapsed ? "space-y-4" : "space-y-8"
        )}
      >
        {navigationGroups.map((group) => (
          <div key={group.title} className={cn("my-1", isCollapsed && "my-4")}>
            <div className={cn("space-y-1", isCollapsed && "space-y-4")}>
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

      {/* FOOTER */}
      <div className="border-t border-white/10 bg-white/5 p-4">
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "w-full text-white transition-all duration-200 hover:bg-white/10",
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
              {isLoggingOut ? "Signing out..." : "Log Out"}
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
  onNavigate?: (to?: string) => void
  isCollapsed: boolean
}) {
  const Icon = item.icon

  const isActive = isNavigationItemActive(item, activePath)

  const hasChildren = !!item.children?.length

  const [showPopup, setShowPopup] = useState(false)

  const baseStyles = cn(
    "group flex w-full items-center rounded-xl transition-all duration-200",
    isCollapsed ? "mx-auto justify-center p-3" : "gap-x-2 px-3 py-2.5",
    isActive || isExpanded
      ? "bg-white/20 font-semibold text-white"
      : "text-white hover:bg-white/10"
  )

  // =====================================
  // ITEMS WITH CHILDREN
  // =====================================

  if (hasChildren) {
    const triggerButton = (
      <button
        type="button"
        onClick={() => {
          if (!isCollapsed) {
            onToggleExpanded(item.title)
          }
        }}
        className={baseStyles}
      >
        {/* LEFT */}
        <div className="flex items-center gap-2">
          <Icon className="size-5 shrink-0" />

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
              "ml-auto size-4 transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
        )}
      </button>
    )

    if (isCollapsed) {
      return (
        <Popover open={showPopup} onOpenChange={setShowPopup}>
          <PopoverTrigger asChild>
            {triggerButton}
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="start"
            sideOffset={12}
            className="w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl z-[9999]"
          >
            {/* TITLE */}
            <div className="mb-2 px-3 py-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {item.title}
            </div>

            {/* CHILDREN */}
            <div className="space-y-1">
              {item.children?.map((child) => {
                const childIsActive = isNavigationItemActive(child, activePath)
                const ChildIcon = child.icon

                return (
                  <NavLink
                    key={child.to}
                    to={child.to ?? "#"}
                    onClick={() => {
                      setShowPopup(false)
                      onNavigate?.(child.to)
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                      childIsActive
                        ? "bg-blue-50 font-medium text-blue-600"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    {ChildIcon && <ChildIcon className="size-4 shrink-0" />}
                    <span>{child.title}</span>
                  </NavLink>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>
      )
    }

    return (
      <div className="relative w-full overflow-visible">
        {triggerButton}

        {/* =====================================
            EXPANDED ACCORDION
        ===================================== */}
        {isExpanded && (
          <div className="mt-1 ml-5 space-y-1 border-l border-white/10 py-1 pl-4">
            {item.children?.map((child) => {
              const childIsActive = isNavigationItemActive(child, activePath)
              const ChildIcon = child.icon

              return (
                <NavLink
                  key={child.to}
                  to={child.to ?? "#"}
                  onClick={() => onNavigate?.(child.to)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200",
                    childIsActive
                      ? "bg-white/15 text-white shadow-sm"
                      : "text-white/90 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {ChildIcon && (
                    <ChildIcon className="size-3.5 shrink-0 opacity-90" />
                  )}
                  <span className="truncate">{child.title}</span>
                </NavLink>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // =====================================
  // NORMAL ITEM
  // =====================================

  return (
    <NavLink
      to={item.to ?? "#"}
      onClick={() => onNavigate?.(item.to)}
      className={baseStyles}
    >
      <Icon className="size-5 shrink-0" />

      {!isCollapsed && (
        <span className="truncate text-sm font-medium">{item.title}</span>
      )}
    </NavLink>
  )
}
