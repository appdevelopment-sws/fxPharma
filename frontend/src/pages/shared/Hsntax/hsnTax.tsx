import React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SectionCard from "@/components/SectionCard"
import { Percent, Hash, Link as LinkIcon } from "lucide-react"
import { Outlet, useLocation, useNavigate } from "react-router"

const TaxHsnPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Get the current tab from the URL path
  const currentTab = location.pathname.split("/").pop() || "tax"

  return (
    <div className="">
      <SectionCard
        title="Tax & HSN Management"
        description="Manage your tax rates, HSN codes, and mappings here."
      >
        <Tabs
          value={currentTab}
          onValueChange={(value) => navigate(value)}
          className="w-full"
        >
          <TabsList className="mb-6 bg-muted/50 px-3 py-6">
            <TabsTrigger value="tax" className="gap-2 p-4">
              <Percent className="size-4" />
              Tax
            </TabsTrigger>
            <TabsTrigger value="hsn" className="gap-2 p-4">
              <Hash className="size-4" />
              HSN Tax
            </TabsTrigger>
            <TabsTrigger value="mapping" className="gap-2 p-4">
              <LinkIcon className="size-4" />
              HSN Mapping
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

export default TaxHsnPage
