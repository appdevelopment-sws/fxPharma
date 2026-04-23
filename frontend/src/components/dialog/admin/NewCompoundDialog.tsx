import { useEffect } from "react"
import { useFieldArray, useForm, type SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FormContainer } from "@/components/formContainer"
import {
    FormField,
    FormSelectField,
    FormTextarea,
    FormCheckbox,
} from "@/components/ui/form-fields"

import sectionHeader from "@/components/sectionHeader"

import {
    COMPOUNDING_FORM_INITIAL_DATA,
    DOSAGE_FORM_OPTIONS,
    UNIT_OPTIONS,
    BUD_OPTIONS,
    INGREDIENT_TYPE_OPTIONS,
} from "@/constants/page/admin/newcompound"

interface CompoundingDialogProps {
    open: boolean
    onClose: (open: boolean) => void
    compound?: any | null
}

export default function CompoundingDialog({
    open,
    onClose,
    compound,
}: CompoundingDialogProps) {
    const isViewMode = !!compound?.viewMode
    const isEditMode = !!compound?.id

    const { handleSubmit, control, reset } = useForm({
        defaultValues: COMPOUNDING_FORM_INITIAL_DATA,
        mode: "onChange",
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "ingredients",
    })

    useEffect(() => {
        if (open) {
            if (isEditMode || isViewMode) {
                reset({
                    ...COMPOUNDING_FORM_INITIAL_DATA,
                    ...compound,
                })
            } else {
                reset(COMPOUNDING_FORM_INITIAL_DATA)
            }
        }
    }, [open, compound, reset])

    const queryClient = useQueryClient()

    const handleMutation = useMutation({
        mutationFn: async (data: any) => data,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["compounding"],
            })
            reset()
            onClose(false)
        },
    })

    const onSubmit: SubmitHandler<any> = (data) => {
        handleMutation.mutate(data)
    }

    return (
        <FormContainer
            variant="modal"
            open={open}
            onOpenChange={(isOpen) => onClose(isOpen)}
            title={
                isViewMode
                    ? "View Prescription Compound"
                    : isEditMode
                        ? "Edit Prescription Compound"
                        : "Create New Prescription Compound"
            }
            size="full"
            footer={
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onClose(false)}>
                        {isViewMode ? "Close" : "Cancel"}
                    </Button>

                    {!isViewMode && (
                        <Button
                            type="submit"
                            form="compound-form"
                            disabled={handleMutation.isPending}
                        >
                            {handleMutation.isPending ? "Saving..." : "Save Compound"}
                        </Button>
                    )}
                </div>
            }
        >
            <form
                id="compound-form"
                onSubmit={handleSubmit(onSubmit)}
                className="grid gap-6 xl:grid-cols-3"
            >
                {/* LEFT SIDE */}
                <div className="space-y-6 xl:col-span-2">
                    {/* INGREDIENTS */}
                    <div className="rounded-xl border p-6">
                        <div className="mb-5 flex items-center justify-between">
                            {sectionHeader("01", "Active Ingredients & Base")}

                            {!isViewMode && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        append({
                                            ingredient: "",
                                            type: "Active",
                                            quantity: "",
                                            unit: "%",
                                        })
                                    }
                                >
                                    <Plus className="mr-2 size-4" />
                                    Add Ingredient
                                </Button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="grid gap-4 md:grid-cols-4 xl:grid-cols-5"
                                >
                                    <FormField
                                        control={control}
                                        name={`ingredients.${index}.ingredient`}
                                        label={index === 0 ? "Ingredient" : ""}
                                        readOnly={isViewMode}
                                    />

                                    <FormSelectField
                                        control={control}
                                        name={`ingredients.${index}.type`}
                                        label={index === 0 ? "Type" : ""}
                                        options={INGREDIENT_TYPE_OPTIONS}
                                        readOnly={isViewMode}
                                    />

                                    <FormField
                                        control={control}
                                        name={`ingredients.${index}.quantity`}
                                        label={index === 0 ? "Quantity / Dose" : ""}
                                        readOnly={isViewMode}
                                    />

                                    <FormSelectField
                                        control={control}
                                        name={`ingredients.${index}.unit`}
                                        label={index === 0 ? "Unit" : ""}
                                        options={UNIT_OPTIONS}
                                        readOnly={isViewMode}
                                    />

                                    {!isViewMode && (
                                        <div className="flex items-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => remove(index)}
                                            >
                                                <Trash2 className="size-4 text-red-500" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 rounded-lg bg-muted px-4 py-3 text-sm font-medium">
                            Total Compound Volume: 100 g
                        </div>
                    </div>

                    {/* PREPARATION */}
                    <div className="rounded-xl border p-6">
                        {sectionHeader("02", "Preparation Instructions")}

                        <div className="space-y-5">
                            <FormTextarea
                                control={control}
                                name="instructions"
                                rows={5}
                                placeholder="Enter step-by-step compounding instructions..."
                                readOnly={isViewMode} label={"instructions"} />

                            <div className="grid gap-4 md:grid-cols-2">
                                <FormCheckbox
                                    control={control}
                                    name="requires_homogenizer"
                                    label="Requires homogenizer"
                                />

                                <FormCheckbox
                                    control={control}
                                    name="requires_unguator"
                                    label="Requires unguator"
                                />

                                <FormCheckbox
                                    control={control}
                                    name="light_sensitive"
                                    label="Light sensitive (Use Amber container)"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="space-y-6">
                    {/* DETAILS */}
                    <div className="rounded-xl border p-6">
                        {sectionHeader("03", "Prescription Details")}

                        <div className="space-y-5">
                            <FormField
                                control={control}
                                name="compound_name"
                                label="Compound Name"
                                readOnly={isViewMode}
                            />

                            <div className="grid gap-4 md:grid-cols-2">
                                <FormSelectField
                                    control={control}
                                    name="dosage_form"
                                    label="Dosage Form"
                                    options={DOSAGE_FORM_OPTIONS}
                                    readOnly={isViewMode}
                                />

                                <div className="grid grid-cols-2 gap-2">
                                    <FormField
                                        control={control}
                                        name="total_qty"
                                        label="Total Qty"
                                        readOnly={isViewMode}
                                    />

                                    <FormSelectField
                                        control={control}
                                        name="total_unit"
                                        label=" "
                                        options={UNIT_OPTIONS}
                                        readOnly={isViewMode}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={control}
                                    name="days_supply"
                                    label="Days Supply"
                                    readOnly={isViewMode}
                                />

                                <div className="grid grid-cols-2 gap-2">
                                    <FormField
                                        control={control}
                                        name="beyond_use_date"
                                        label="Beyond Use Date"
                                        readOnly={isViewMode}
                                    />

                                    <FormSelectField
                                        control={control}
                                        name="beyond_use_unit"
                                        label=" "
                                        options={BUD_OPTIONS}
                                        readOnly={isViewMode}
                                    />
                                </div>
                            </div>

                            <FormField
                                control={control}
                                name="patient"
                                label="Patient"
                                placeholder="Search by name or phone..."
                                readOnly={isViewMode}
                            />

                            <FormField
                                control={control}
                                name="provider"
                                label="Prescribing Provider"
                                placeholder="Search doctors..."
                                readOnly={isViewMode}
                            />
                        </div>
                    </div>

                    {/* SIG */}
                    <div className="rounded-xl border p-6">
                        {sectionHeader("04", "Sig / Directions")}

                        <FormTextarea
                            control={control}
                            name="sig_directions"
                            rows={5}
                            readOnly={isViewMode} label={"sig"} />
                    </div>
                </div>
            </form>
        </FormContainer>
    )
}