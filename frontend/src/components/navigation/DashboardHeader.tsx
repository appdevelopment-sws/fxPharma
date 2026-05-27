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
import { ModeToggle } from "@/components/mode-toggle"

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
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

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
    <header className="sticky top-0 z-30 h-16 border-b border-border dark:border-zinc-800 bg-white dark:bg-zinc-950 text-foreground dark:text-zinc-100 shadow-sm">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile trigger & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-slate-100 hover:text-foreground lg:hidden"
            onClick={onOpenSidebar}
          >
            <Menu className="size-5" />
            <span className="sr-only">Open sidebar</span>
          </Button>

          <div className="hidden items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase sm:flex">
            <span className="cursor-default transition-colors hover:text-foreground">
              {appLabel}
            </span>
            <ChevronRight className="size-3.5 opacity-50" />
            <span className="cursor-default transition-colors hover:text-foreground">
              {workspaceLabel}
            </span>
            {activeItemTitle && (
              <>
                <ChevronRight className="size-3.5 opacity-50" />
                <span className="font-bold text-foreground">{activeItemTitle}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search - Desktop only for now */}


          <div className="flex items-center gap-1 border-r border-border pr-2 sm:gap-2">
            {/* Live Clock & Date */}
            <div className="hidden sm:flex flex-col items-end justify-center mr-2 border-r border-border pr-4">
              <span className="text-xs font-bold text-foreground tracking-wide leading-none">
                {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
              <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest mt-1">
                {now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="hidden text-muted-foreground hover:bg-slate-100 hover:text-foreground sm:flex"
            >
              {isFullscreen ? (
                <Minimize className="size-5" />
              ) : (
                <Maximize className="size-5" />
              )}
            </Button>
            <div className="relative">
              <ModeToggle />
            </div>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:bg-slate-100 hover:text-foreground"
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
                  <p className="text-sm leading-none font-semibold text-foreground transition-colors group-hover:text-primary">
                    {userName}
                  </p>
                  <p className="mt-1 text-[10px] leading-none font-bold tracking-tighter text-muted-foreground uppercase">
                    {userRole}
                  </p>
                </div>
                <div className="relative flex size-9 items-center justify-center rounded-full bg-primary dark:bg-zinc-800 text-xs font-bold text-white shadow-sm ring-2 ring-slate-100 transition-all group-hover:ring-slate-200">
                  {userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                  <div className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-white bg-green-500 ring-1 ring-white/10" />
                </div>
                <ChevronDown className="hidden size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 sm:block" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={10}
              className="w-80 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 text-slate-900 dark:text-zinc-100 shadow-xl"
            >
              <div className="space-y-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-full bg-primary dark:bg-zinc-800 text-sm font-bold text-white shadow-sm">
                    {userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {userName}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {userRole}
                    </p>
                    {userEmail && (
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
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
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
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
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
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
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-600 dark:text-rose-500 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:cursor-not-allowed disabled:opacity-60"
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
