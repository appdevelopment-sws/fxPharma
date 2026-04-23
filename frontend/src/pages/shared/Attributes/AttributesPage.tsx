import React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SectionCard from "@/components/SectionCard"
import { Tag, Layers, Factory, Scale } from "lucide-react"
import { Outlet, useLocation, useNavigate } from "react-router"

const AttributesPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Get the current tab from the URL path
  const currentTab = location.pathname.split("/").pop() || "brands"

  return (
    <div className="p-6">
      <SectionCard
        title="Attributes Management"
        description="Manage your product attributes like brands, categories, manufacturers, and units."
      >
        <Tabs
          value={currentTab}
          onValueChange={(value) => navigate(value)}
          className="w-full"
        >
          <TabsList className="mb-6 bg-muted/50 px-3 py-6">
            <TabsTrigger value="brands" className="gap-2 p-4">
              <Tag className="size-4" />
              Brands
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2 p-4">
              <Layers className="size-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="manufacturers" className="gap-2 p-4">
              <Factory className="size-4" />
              Manufacturers
            </TabsTrigger>
            <TabsTrigger value="units" className="gap-2 p-4">
              <Scale className="size-4" />
              Units
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

export default AttributesPage
