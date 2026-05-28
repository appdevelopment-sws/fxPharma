import { useMemo, useState, useEffect, type ReactNode } from "react"
import { Outlet, useLocation } from "react-router"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DashboardSidebar } from "./DashboardSidebar"
import { DashboardHeader } from "./DashboardHeader"
import {
  flattenNavigationItems,
  isNavigationItemActive,
  type SidebarNavigationGroup,
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
  onOpenProfile?: () => void
  onOpenSettings?: () => void
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
  onOpenProfile,
  onOpenSettings,
}: WorkspaceShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (location.pathname.includes("/pos")) {
      setIsCollapsed(true)
    } else {
      setIsCollapsed(false)
    }
  }, [location.pathname])

  const activeItem = useMemo(() => {
    const allItems = flattenNavigationItems(navigationGroups)
    return (
      allItems.find((item) => item.to === location.pathname) ||
      allItems.find((item) => isNavigationItemActive(item, location.pathname))
    )
  }, [location.pathname, navigationGroups])
  console.log("workspaceSubtitle", workspaceSubtitle)
  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        onMouseEnter={() => {
          if (location.pathname.includes("/pos") && isCollapsed) {
            setIsCollapsed(false)
          }
        }}
        onMouseLeave={() => {
          if (location.pathname.includes("/pos") && !isCollapsed) {
            setIsCollapsed(true)
          }
        }}
        className={cn(
          "relative z-40 hidden h-screen shrink-0 overflow-hidden border-r border-white/20 bg-sidebar transition-[width] duration-550 ease-out will-change-[width] lg:block dark:border-primary dark:bg-primary",
          isCollapsed ? "w-20" : "w-[220px]"
        )}
      >
        <DashboardSidebar
          workspaceTitle={workspaceTitle}
          workspaceSubtitle={workspaceSubtitle}
          navigationGroups={navigationGroups}
          brandIcon={brandIcon}
          isCollapsed={isCollapsed}
          activePath={location.pathname}
          isLoggingOut={isLoggingOut}
          onLogout={onLogout}
          onNavigate={(to) => {
            if (to && to.includes("/pos")) {
              setIsCollapsed(true)
            }
          }}
        />
      </aside>

      {/* Collapse Toggle Button */}
      {!location.pathname.includes("/pos") && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(
            "absolute top-20 z-50 size-6 rounded-full border-slate-200 bg-white text-[#2563EB] shadow-md transition-[left] duration-550 ease-out hover:bg-slate-50 hover:text-blue-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white hidden lg:flex items-center justify-center",
            isCollapsed ? "left-[68px]" : "left-[208px]"
          )}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="size-3" />
          ) : (
            <ChevronLeft className="size-3" />
          )}
        </Button>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader
          appLabel={appLabel}
          workspaceLabel={workspaceLabel}
          activeItemTitle={activeItem?.title}
          userName={userName}
          userAvatar={workspaceSubtitle}
          userRole={userRole}
          userEmail={userEmail}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenProfile={onOpenProfile}
          onOpenSettings={onOpenSettings}
          onLogout={onLogout}
          isLoggingOut={isLoggingOut}
        />

        <main className="flex-1 scrollbar-thin scrollbar-thumb-slate-200 overflow-y-auto bg-[#f0f4fa] dark:scrollbar-thumb-zinc-700 dark:bg-zinc-900">
          <div
            className={cn(
              "mx-auto h-full w-full p-4 sm:p-3 lg:p-4",
              isCollapsed ? "lg:pl-8" : "lg:p-6"
            )}
          >
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[220px] animate-in flex-col border-r border-white/20 bg-sidebar shadow-2xl duration-300 slide-in-from-left dark:border-zinc-800 dark:bg-zinc-950">
            <div className="absolute top-4 right-4 z-10 transition-transform active:scale-95">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/10 text-white hover:bg-white/20"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
            <DashboardSidebar
              workspaceTitle={workspaceTitle}
              workspaceSubtitle={workspaceSubtitle}
              navigationGroups={navigationGroups}
              brandIcon={brandIcon}
              isCollapsed={false}
              activePath={location.pathname}
              isLoggingOut={isLoggingOut}
              onLogout={onLogout}
              onNavigate={(to) => {
                setIsSidebarOpen(false)
                if (to && to.includes("/pos")) {
                  setIsCollapsed(true)
                }
              }}
            />
          </aside>
        </div>
      )}
    </div>
  )
}
