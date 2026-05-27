import React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SectionCard from "@/components/SectionCard"
import { Building2, FileText, ShieldAlert } from "lucide-react"
import { Outlet, useLocation, useNavigate } from "react-router"

const SettingsView = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Get the current tab from the URL path
  const currentTab = location.pathname.split("/").pop() || "organization"

  return (
    <div className="">
      <SectionCard
        title="Settings & Configuration"
        description="Configure your store profile, branding, invoicing sequence, custom terms, and toggles."
      >
        <Tabs
          value={currentTab}
          onValueChange={(value) => navigate(value)}
          className="w-full"
        >
          <TabsList className="mb-6 bg-muted/50 px-3 py-6">
            <TabsTrigger value="organization" className="gap-2 p-4">
              <Building2 className="size-4" />
              Organization Profile
            </TabsTrigger>
            <TabsTrigger value="invoice" className="gap-2 p-4">
              <FileText className="size-4" />
              Invoice Customization
            </TabsTrigger>
            <TabsTrigger value="pharmacy" className="gap-2 p-4">
              <ShieldAlert className="size-4" />
              Pharmacy Operations
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <Outlet />
          </div>
        </Tabs>
      </SectionCard>
    </div>
  )
}

export default SettingsView
