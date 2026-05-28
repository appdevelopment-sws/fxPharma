import { useState, useEffect, useMemo, type ReactNode } from "react"
import { NavLink } from "react-router"
import { ChevronDown, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn, getImageUrl } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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

function isValidLogo(path: string | undefined | null): boolean {
  if (!path) return false
  const lowerPath = path.trim().toLowerCase()
  if (
    lowerPath === "tenant workspace" ||
    lowerPath === "" ||
    lowerPath.includes("manage tenants, users, and platform-wide settings")
  ) {
    return false
  }
  return (
    path.startsWith("http") ||
    path.startsWith("data:") ||
    path.startsWith("/") ||
    path.includes(".") ||
    path.includes("/")
  )
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

  const hasCustomLogo = isValidLogo(workspaceSubtitle)
  // const logoSrc = hasCustomLogo ? getImageUrl(workspaceSubtitle) : "/logo.png"
  const logoSrc = "/logo.png"

  return (
    <div className="flex h-full flex-col bg-sidebar text-[#D1D5DB]">
      {/* Brand Header */}
      <div
        className={cn(
          "flex shrink-0 flex-col items-center justify-center border-b border-white/10 text-center dark:border-zinc-800",
          isCollapsed ? "h-16 px-0" : "gap-2 px-4 py-4"
        )}
      >
        {isCollapsed ? (
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5">
            <img
              src={logoSrc}
              alt={workspaceTitle}
              className={cn(
                "h-full w-full",
                hasCustomLogo ? "object-contain p-1" : "object-contain p-1.5"
              )}
            />
          </div>
        ) : (
          <>
            <div className="flex h-12 w-full items-center justify-center overflow-hidden">
              <img
                src={logoSrc}
                alt={workspaceTitle}
                className={cn(
                  "h-full w-full",
                  hasCustomLogo ? "object-contain" : "object-contain p-1"
                )}
              />
            </div>
            {/* <div className="w-full min-w-0">
              <h2 className="truncate text-base font-bold tracking-tight text-[#D1D5DB]">
                {workspaceTitle}
              </h2>
            </div> */}
          </>
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

      {/* Footer / Logout */}
      <div className="border-t border-white/10 bg-white/5 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "w-full text-white transition-all duration-200 hover:bg-rose-500/20 hover:text-rose-200 dark:hover:bg-rose-500/10 dark:hover:text-rose-400",
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
    "group flex w-full items-center transition-all duration-200",
    isCollapsed
      ? "mx-auto justify-center rounded-full p-3"
      : "gap-x-2 rounded-full border-l-4 px-3 py-2.5",
    isActive || isExpanded
      ? cn(
          "font-semibold text-white",
          !isCollapsed && "border-l-4 border-[#FF7A00] pl-2"
        )
      : "text-[#D1D5DB] hover:bg-[#163B68] hover:text-white"
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
          <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          <PopoverContent
            side="right"
            align="start"
            sideOffset={12}
            className="z-[9999] w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl"
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
                      "flex items-center gap-2 rounded-full border-l-[3px] px-3 py-2 text-sm transition-all duration-200",
                      childIsActive
                        ? "bg-blue-50 font-medium text-[#0B4F9C]"
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
                    "flex items-center gap-2.5 rounded-full border-l-[3px] px-3 py-2 text-[13px] font-medium transition-all duration-200",
                    childIsActive
                      ? "bg-[#0B4F9C] text-white shadow-sm"
                      : "text-[#D1D5DB] hover:bg-[#163B68] hover:text-white"
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
