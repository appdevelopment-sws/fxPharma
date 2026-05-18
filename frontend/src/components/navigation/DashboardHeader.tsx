import { useState, useEffect } from "react"
import {
  Bell,
  ChevronRight,
  Menu,
  Search,
  Globe,
  Settings,
  ChevronDown,
  Maximize,
  Minimize,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  appLabel: string
  workspaceLabel: string
  activeItemTitle?: string
  userName: string
  userRole: string
  userEmail?: string
  onOpenSidebar: () => void
}

export function DashboardHeader({
  appLabel,
  workspaceLabel,
  activeItemTitle,
  userName,
  userRole,
  userEmail,
  onOpenSidebar,
}: DashboardHeaderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

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
    <header className="sticky top-0 z-30 h-16 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile trigger & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-accent lg:hidden"
            onClick={onOpenSidebar}
          >
            <Menu className="size-5" />
            <span className="sr-only">Open sidebar</span>
          </Button>

          <div className="hidden items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase sm:flex">
            <span className="cursor-default transition-colors hover:text-blue-600">
              {appLabel}
            </span>
            <ChevronRight className="size-3.5 opacity-50" />
            <span className="cursor-default transition-colors hover:text-blue-600">
              {workspaceLabel}
            </span>
            {activeItemTitle && (
              <>
                <ChevronRight className="size-3.5 opacity-50" />
                <span className="font-bold text-primary">
                  {activeItemTitle}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search - Desktop only for now */}
          <div className="relative mr-2 hidden items-center md:flex">
            <Search className="absolute left-3 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="h-9 w-48 rounded-full border-transparent bg-muted/50 pr-4 pl-10 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-blue-500/20 lg:w-64 dark:bg-slate-800"
            />
          </div>

          <div className="flex items-center gap-1 border-r border-border pr-2 sm:gap-2">
            {/* <Button
              variant="ghost"
              size="icon"
              className="hidden text-muted-foreground hover:bg-accent hover:text-accent-foreground sm:flex"
            >
              <Globe className="size-5" />
            </Button> */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="hidden text-muted-foreground hover:bg-accent hover:text-accent-foreground sm:flex"
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
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Bell className="size-5" />
              </Button>
            </div>
          </div>

          {/* User Profile */}
          <button className="group flex items-center gap-3 pl-2 outline-none">
            <div className="hidden text-right lg:block">
              <p className="text-sm leading-none font-semibold text-foreground transition-colors group-hover:text-blue-600">
                {userName}
              </p>
              <p className="mt-1 text-[10px] leading-none font-bold tracking-tighter text-muted-foreground uppercase">
                {userRole}
              </p>
            </div>
            <div className="relative flex size-9 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm ring-2 ring-white transition-all group-hover:ring-blue-100 dark:ring-slate-900">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")}
              <div className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-white bg-green-500 ring-1 ring-slate-100 dark:border-slate-900 dark:ring-slate-800" />
            </div>
            {/* <ChevronDown className="size-4 text-muted-foreground transition-colors group-hover:text-blue-600" /> */}
          </button>
        </div>
      </div>
    </header>
  )
}
