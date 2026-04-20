import React from "react"
import SectionCard from "@/components/SectionCard"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { FilterBar } from "@/components/filter-bar"
import useSearchFilter from "@/hooks/useSearchFilter"
import { INITIAL_STORE_FILTERS } from "@/constants/page/super-admin/store"

const StoreList = () => {
  const { filter, handleFilter } = useSearchFilter(INITIAL_STORE_FILTERS)
  return (
    <div className="space-y-6">
      {" "}
      <SectionCard
        title="Store List"
        description="Manage reusable product metadata linked to company, product type, and HSN records."
        action={
          <Button type="button">
            <Plus className="mr-2 size-4" />
            Add Store
          </Button>
        }
      >
        <div className="space-y-4">
          <FilterBar values={filter} onChange={handleFilter}>
            <FilterBar.Search
              name="search"
              placeholder="Search by product name, generic, or brand..."
            />
            {/* Keeping these as simple text inputs to search by IDs as per simplified API limits */}
            <FilterBar.Search name="companyId" placeholder="Company ID" />
            <FilterBar.Search
              name="productTypeId"
              placeholder="Product Type ID"
            />
            <FilterBar.Search name="hsnCodeId" placeholder="HSN ID" />
          </FilterBar>
        </div>
      </SectionCard>
    </div>
  )
}

export default StoreList
