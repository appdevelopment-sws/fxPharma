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
    <header className="sticky top-0 z-30 h-16 border-b border-blue-700 bg-[#2563EB] text-white">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile trigger & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white hover:bg-white/10 lg:hidden"
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
                <span className="font-bold text-white">
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
              className="hidden text-white/80 hover:text-white hover:bg-white/10 sm:flex"
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
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <Bell className="size-5" />
              </Button>
            </div>
          </div>

          {/* User Profile */}
          <button className="group flex items-center gap-3 pl-2 outline-none">
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
          </button>
        </div>
      </div>
    </header>
  )
}
