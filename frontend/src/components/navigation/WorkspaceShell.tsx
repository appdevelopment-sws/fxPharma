import { useEffect, useMemo, useState, type ReactNode } from "react"
import { NavLink, Outlet, useLocation } from "react-router"
import { ChevronDown, ChevronRight, LogOut, Menu, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  flattenNavigationItems,
  isNavigationItemActive,
  type SidebarNavigationGroup,
  type SidebarNavigationItem,
} from "./sidebar-navigation"

type WorkspaceShellProps = {
  appLabel: string
  workspaceLabel: string
  workspaceTitle: string
  workspaceSubtitle: string
  userName: string
  userRole: string
  userEmail?: string
  isLoggingOut: boolean
  navigationGroups: SidebarNavigationGroup[]
  brandIcon: ReactNode
  onLogout: () => void
}

export function WorkspaceShell({
  appLabel,
  workspaceLabel,
  workspaceTitle,
  workspaceSubtitle,
  userName,
  userRole,
  userEmail,
  isLoggingOut,
  navigationGroups,
  brandIcon,
  onLogout,
}: WorkspaceShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  const activeItem = useMemo(() => {
    return flattenNavigationItems(navigationGroups).find((item) =>
      isNavigationItemActive(item, location.pathname)
    )
  }, [location.pathname, navigationGroups])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.1),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,1))] text-foreground">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-80 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
          <div className="flex h-full flex-col px-5 py-5">
            <SidebarContent
              workspaceTitle={workspaceTitle}
              workspaceSubtitle={workspaceSubtitle}
              userName={userName}
              userRole={userRole}
              activePath={location.pathname}
              isLoggingOut={isLoggingOut}
              onNavigate={() => setIsSidebarOpen(false)}
              onLogout={onLogout}
              navigationGroups={navigationGroups}
              brandIcon={brandIcon}
            />
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="lg:hidden"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu />
                  <span className="sr-only">Open sidebar</span>
                </Button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs tracking-[0.22em] text-muted-foreground uppercase">
                    <span>{appLabel}</span>
                    <ChevronRight className="size-3" />
                    <span>{workspaceLabel}</span>
                  </div>
                  <h1 className="truncate text-lg font-semibold tracking-tight">
                    {activeItem?.title ?? workspaceTitle}
                  </h1>
                </div>
              </div>

              <div className="hidden items-center gap-3 sm:flex">
                <Badge variant="outline" className="px-3 py-1">
                  {userRole}
                </Badge>
                <div className="text-right">
                  <p className="text-sm font-medium">{userName}</p>
                  {userEmail ? (
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col border-r border-sidebar-border bg-sidebar p-4 shadow-2xl">
            <div className="mb-3 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </div>
            <SidebarContent
              workspaceTitle={workspaceTitle}
              workspaceSubtitle={workspaceSubtitle}
              userName={userName}
              userRole={userRole}
              activePath={location.pathname}
              isLoggingOut={isLoggingOut}
              onNavigate={() => setIsSidebarOpen(false)}
              onLogout={onLogout}
              navigationGroups={navigationGroups}
              brandIcon={brandIcon}
            />
          </aside>
        </div>
      )}
    </div>
  )
}

type SidebarContentProps = {
  workspaceTitle: string
  workspaceSubtitle: string
  userName: string
  userRole: string
  activePath: string
  isLoggingOut: boolean
  onNavigate: () => void
  onLogout: () => void
  navigationGroups: SidebarNavigationGroup[]
  brandIcon: ReactNode
}

function SidebarContent({
  workspaceTitle,
  workspaceSubtitle,
  userName,
  userRole,
  activePath,
  isLoggingOut,
  onNavigate,
  onLogout,
  navigationGroups,
  brandIcon,
}: SidebarContentProps) {
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
    <>
      <div className="rounded-3xl border border-sidebar-border bg-sidebar-accent/40 p-1">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
            {brandIcon}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-sidebar-foreground">
              {workspaceTitle}
            </h2>
          </div>
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-6 overflow-y-auto">
        {navigationGroups.map((group) => (
          <div key={group.title}>
            <p className="px-2 text-[11px] font-medium tracking-[0.24em] text-sidebar-foreground/50 uppercase">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <SidebarNavigationEntry
                  key={item.to ?? item.title}
                  item={item}
                  activePath={activePath}
                  isExpanded={expandedItems.includes(item.title)}
                  onToggleExpanded={toggleExpandedItem}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-6 rounded-3xl">
        {/* <div className="space-y-1">
          <p className="truncate text-sm font-medium text-sidebar-foreground">
            {userName}
          </p>
          <p className="text-xs tracking-[0.2em] text-sidebar-foreground/55 uppercase">
            {userRole}
          </p>
        </div> */}
        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full justify-start border-sidebar-border bg-destructive text-accent hover:bg-destructive/90"
          onClick={onLogout}
          disabled={isLoggingOut}
        >
          <LogOut />
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    </>
  )
}

type SidebarNavigationEntryProps = {
  item: SidebarNavigationItem
  activePath: string
  isExpanded: boolean
  onToggleExpanded: (title: string) => void
  onNavigate: () => void
}

function SidebarNavigationEntry({
  item,
  activePath,
  isExpanded,
  onToggleExpanded,
  onNavigate,
}: SidebarNavigationEntryProps) {
  const Icon = item.icon
  const isActive = isNavigationItemActive(item, activePath)

  if (item.children?.length) {
    return (
      <div className="rounded-2xl">
        <button
          type="button"
          onClick={() => onToggleExpanded(item.title)}
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl border px-3 py-1 text-left transition-colors",
            isActive
              ? "border-sidebar-primary/20 bg-sidebar-primary/95 text-sidebar-primary-foreground shadow-sm"
              : "border-transparent text-sidebar-foreground/80 hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
        >
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              isActive
                ? "bg-white/14"
                : "bg-sidebar-accent/70 text-sidebar-foreground"
            )}
          >
            <Icon className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {item.title}
            </span>
            {/* <span
              className={cn(
                "block truncate text-xs",
                isActive
                  ? "text-sidebar-primary-foreground/80"
                  : "text-sidebar-foreground/55"
              )}
            >
              {item.description}
            </span> */}
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </button>

        {isExpanded && (
          <div className="mt-2 ml-4 space-y-1 border-l border-sidebar-border/80 py-1 pl-5">
            {item.children.map((child) => {
              const childIsActive = isNavigationItemActive(child, activePath)

              return (
                <NavLink
                  key={child.to ?? child.title}
                  to={child.to ?? "#"}
                  onClick={onNavigate}
                  className={cn(
                    "block rounded-xl px-3 py-2.5 text-sm transition-colors",
                    childIsActive
                      ? "bg-sidebar-accent text-sidebar-foreground shadow-sm"
                      : "text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                  )}
                >
                  <span className="block font-medium">{child.title}</span>
                  {/* <span className="block pt-0.5 text-xs text-sidebar-foreground/55">
                    {child.description}
                  </span> */}
                </NavLink>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      to={item.to ?? "#"}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-3 rounded-2xl border px-3 py-1 transition-colors",
        isActive
          ? "border-sidebar-primary/20 bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
          : "border-transparent text-sidebar-foreground/80 hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-foreground"
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl",
          isActive
            ? "bg-white/14"
            : "bg-sidebar-accent/70 text-sidebar-foreground"
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{item.title}</span>
        {/* <span
          className={cn(
            "block truncate text-xs",
            isActive
              ? "text-sidebar-primary-foreground/80"
              : "text-sidebar-foreground/55"
          )}
        >
          {item.description}
        </span> */}
      </span>
    </NavLink>
  )
}
