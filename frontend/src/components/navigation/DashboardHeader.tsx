import { useEffect, useState } from "react"
import {
  Bell,
  ChevronRight,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  UserCircle2,
  Maximize,
  Minimize,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  appLabel: string
  workspaceLabel: string
  activeItemTitle?: string
  userName: string
  userRole: string
  userEmail?: string
  onOpenSidebar: () => void
  onOpenProfile?: () => void
  onOpenSettings?: () => void
  onLogout?: () => void
  isLoggingOut?: boolean
}

export function DashboardHeader({
  appLabel,
  workspaceLabel,
  activeItemTitle,
  userName,
  userRole,
  userEmail,
  onOpenSidebar,
  onOpenProfile,
  onOpenSettings,
  onLogout,
  isLoggingOut,
}: DashboardHeaderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-blue-700 bg-[#2563EB] text-white">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile trigger & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={onOpenSidebar}
          >
            <Menu className="size-5" />
            <span className="sr-only">Open sidebar</span>
          </Button>

          <div className="hidden items-center gap-2 text-xs font-medium tracking-wider text-white/70 uppercase sm:flex">
            <span className="cursor-default transition-colors hover:text-white">
              {appLabel}
            </span>
            <ChevronRight className="size-3.5 opacity-50" />
            <span className="cursor-default transition-colors hover:text-white">
              {workspaceLabel}
            </span>
            {activeItemTitle && (
              <>
                <ChevronRight className="size-3.5 opacity-50" />
                <span className="font-bold text-white">{activeItemTitle}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search - Desktop only for now */}
          <div className="relative mr-2 hidden items-center md:flex">
            <Search className="absolute left-3 size-4 text-white/60" />
            <input
              type="text"
              placeholder="Search..."
              className="h-9 w-48 rounded-full border-transparent bg-white/10 pr-4 pl-10 text-sm text-white transition-all outline-none placeholder:text-white/60 focus:bg-white/20 focus:ring-2 focus:ring-white/20 lg:w-64"
            />
          </div>

          <div className="flex items-center gap-1 border-r border-white/10 pr-2 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="hidden text-white/80 hover:bg-white/10 hover:text-white sm:flex"
            >
              {isFullscreen ? (
                <Minimize className="size-5" />
              ) : (
                <Maximize className="size-5" />
              )}
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:bg-white/10 hover:text-white"
              >
                <Bell className="size-5" />
              </Button>
            </div>
          </div>

          {/* User Profile */}
          <Popover
            open={isProfileMenuOpen}
            onOpenChange={setIsProfileMenuOpen}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="group flex items-center gap-2 rounded-full pl-2 transition-transform outline-none hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="hidden text-right lg:block">
                  <p className="text-sm leading-none font-semibold text-white transition-colors group-hover:text-white/90">
                    {userName}
                  </p>
                  <p className="mt-1 text-[10px] leading-none font-bold tracking-tighter text-white/70 uppercase">
                    {userRole}
                  </p>
                </div>
                <div className="relative flex size-9 items-center justify-center rounded-full bg-white text-xs font-bold text-[#2563EB] shadow-sm ring-2 ring-white/20 transition-all group-hover:ring-white/40">
                  {userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                  <div className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-white bg-green-500 ring-1 ring-white/10" />
                </div>
                <ChevronDown className="hidden size-4 text-white/70 transition-transform group-data-[state=open]:rotate-180 sm:block" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={10}
              className="w-80 border border-slate-200 bg-white p-3 text-slate-900 shadow-xl"
            >
              <div className="space-y-3 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-full bg-[#2563EB] text-sm font-bold text-white shadow-sm">
                    {userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {userName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {userRole}
                    </p>
                    {userEmail && (
                      <p className="truncate text-xs text-slate-500">
                        {userEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                {onOpenProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      onOpenProfile()
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <UserCircle2 className="size-4 text-slate-500" />
                    Profile
                  </button>
                )}

                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      onOpenSettings()
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <Settings className="size-4 text-slate-500" />
                    Settings
                  </button>
                )}

                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      onLogout()
                    }}
                    disabled={isLoggingOut}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    )}
                  >
                    <LogOut className="size-4" />
                    {isLoggingOut ? "Signing out..." : "Logout"}
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  )
}
