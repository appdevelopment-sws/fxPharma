import { useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FormContainer } from "@/components/formContainer"
import {
    FormSelectField,
    FormSwitch,
} from "@/components/ui/form-fields"

import sectionHeader from "@/components/sectionHeader"
import {
    MEDICINE_TYPE_OPTIONS,
    FORM_FACTOR_OPTIONS,
    THERAPEUTIC_CATEGORY_OPTIONS,
    MANUFACTURER_OPTIONS,
} from "@/constants/page/admin/importinventory"

interface FilterImportInventoryProps {
    open: boolean
    onClose: (open: boolean) => void
    onFilter: (filters: any) => void
    initialFilters?: any
}

export default function FilterImportInventory({
    open,
    onClose,
    onFilter,
    initialFilters,
}: FilterImportInventoryProps) {
    const { handleSubmit, control, reset } = useForm({
        defaultValues: initialFilters,
        mode: "onChange",
    })

    useEffect(() => {
        if (open && initialFilters) {
            reset(initialFilters)
        }
    }, [open, initialFilters, reset])

    const onSubmit: SubmitHandler<any> = (data) => {
        onFilter(data)
        onClose(false)
    }

    const handleReset = () => {
        reset({})
        onFilter({})
        onClose(false)
    }

    return (
        <FormContainer
            variant="modal"
            open={open}
            onOpenChange={(isOpen) => onClose(isOpen)}
            title="Filter Medicines"
            size="lg"
            footer={
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={handleReset}>
                        Reset Filters
                    </Button>
                    <Button
                        type="submit"
                        form="import-inventory-filter-form"
                    >
                        Apply Filters
                    </Button>
                </div>
            }
        >
            <form
                id="import-inventory-filter-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
            >
                <div className="rounded-xl border p-6">
                    {sectionHeader("01", "Classification Filters")}

                    <div className="grid gap-5 md:grid-cols-2">
                        <FormSelectField
                            control={control}
                            name="manufacturer"
                            label="Manufacturer"
                            options={MANUFACTURER_OPTIONS}
                        />

                        <FormSelectField
                            control={control}
                            name="formFactor"
                            label="Form Factor"
                            options={FORM_FACTOR_OPTIONS}
                        />

                        <FormSelectField
                            control={control}
                            name="medicineType"
                            label="Medicine Type"
                            options={MEDICINE_TYPE_OPTIONS}
                        />

                        <FormSelectField
                            control={control}
                            name="therapeuticCategory"
                            label="Therapeutic Category"
                            options={THERAPEUTIC_CATEGORY_OPTIONS}
                        />
                    </div>
                </div>

                <div className="rounded-xl border p-6">
                    {sectionHeader("02", "Regulatory Flags")}

                    <div className="grid gap-5 md:grid-cols-2">
                        <FormSwitch
                            control={control}
                            name="rx_required"
                            label="RX Required"
                            description="Only show prescription medicines"
                        />

                        <FormSwitch
                            control={control}
                            name="otc"
                            label="OTC"
                            description="Only show over-the-counter medicines"
                        />
                    </div>
                </div>
            </form>
        </FormContainer>
    )
}