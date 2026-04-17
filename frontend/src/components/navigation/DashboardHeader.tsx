import { Bell, ChevronRight, Menu, Search, Globe, Settings, ChevronDown } from "lucide-react"
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
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile trigger & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-500 hover:bg-slate-100"
            onClick={onOpenSidebar}
          >
            <Menu className="size-5" />
            <span className="sr-only">Open sidebar</span>
          </Button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-400">
            <span className="hover:text-blue-600 cursor-default transition-colors">{appLabel}</span>
            <ChevronRight className="size-3.5 opacity-50" />
            <span className="hover:text-blue-600 cursor-default transition-colors">{workspaceLabel}</span>
            {activeItemTitle && (
              <>
                <ChevronRight className="size-3.5 opacity-50" />
                <span className="text-slate-900 font-bold">{activeItemTitle}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search - Desktop only for now */}
          <div className="hidden md:flex items-center relative mr-2">
            <Search className="absolute left-3 size-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="h-9 w-48 lg:w-64 rounded-full bg-slate-100/80 border-transparent pl-10 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-1 sm:gap-2 pr-2 border-r border-slate-200">
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 hidden sm:flex">
              <Globe className="size-5" />
            </Button>
            <div className="relative">
              <Button variant="ghost" size="icon" className="text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                <Bell className="size-5" />
                <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                  5
                </span>
              </Button>
            </div>
          </div>

          {/* User Profile */}
          <button className="flex items-center gap-3 pl-2 group outline-none">
            <div className="hidden lg:block text-right">
              <p className="text-sm font-semibold text-slate-900 leading-none group-hover:text-blue-600 transition-colors">
                {userName}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-tighter text-slate-400 leading-none">
                {userRole}
              </p>
            </div>
            <div className="relative flex size-9 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-sm ring-2 ring-white group-hover:ring-blue-100 transition-all">
              {userName.split(' ').map(n => n[0]).join('')}
              <div className="absolute bottom-0 right-0 size-2.5 rounded-full bg-green-500 border-2 border-white ring-1 ring-slate-100" />
            </div>
            <ChevronDown className="size-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>
      </div>
    </header>
  )
}
