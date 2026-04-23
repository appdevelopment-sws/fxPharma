import React, { useState } from "react"
import { useForm } from "react-hook-form"
import {
    Download,
    FileSpreadsheet,
    FileText,
    File,
} from "lucide-react"

import { FormContainer } from "@/components/formContainer"
import { Button } from "@/components/ui/button"
import {
    FormSelectField,
    FormSwitch,
} from "@/components/ui/form-fields"

interface ExportSubscriptionModalProps {
    open: boolean
    onClose: (open: boolean) => void
}

export default function ExportSubscriptionModal({
    open,
    onClose,
}: ExportSubscriptionModalProps) {
    const [isExporting, setIsExporting] = useState(false)

    const { control, handleSubmit, watch, reset, setValue } = useForm({
        defaultValues: {
            format: "csv",
            status_filter: "all",
            plan_pricing: true,
            subscriber_revenue: true,
            usage_features: true,
            history_log: false,
        },
    })

    const selectedFormat = watch("format")

    const onSubmit = async (data: any) => {
        setIsExporting(true)

        try {
            console.log("Exporting...", data)

            await new Promise((resolve) => setTimeout(resolve, 1500))

            onClose(false)
            reset()
        } catch (error) {
            console.error(error)
        } finally {
            setIsExporting(false)
        }
    }

    const formatCards = [
        {
            id: "csv",
            title: "CSV",
            icon: <FileSpreadsheet className="size-5" />,
        },
        {
            id: "excel",
            title: "Excel",
            icon: <Download className="size-5" />,
        },
        {
            id: "pdf",
            title: "PDF",
            icon: <FileText className="size-5" />,
        },
    ]

    return (
        <FormContainer
            variant="modal"
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) reset()
                onClose(isOpen)
            }}
            title="Export Subscription Data"
            description="Choose the format and specific data you want to export."
            size="md"
            footer={
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            reset()
                            onClose(false)
                        }}
                        disabled={isExporting}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isExporting}
                    >
                        {isExporting ? "Exporting..." : "Export Now"}
                    </Button>
                </div>
            }
        >
            <div className="space-y-6 pt-2">
                {/* Export Format */}
                <div>
                    <h4 className="mb-3 text-sm font-semibold">Export Format</h4>

                    <div className="grid grid-cols-3 gap-3">
                        {formatCards.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setValue("format", item.id)}
                                className={`rounded-xl border p-4 text-center transition ${selectedFormat === item.id
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-border"
                                    }`}
                            >
                                <div className="mb-2 flex justify-center">
                                    {item.icon}
                                </div>

                                <p className="text-sm font-medium">{item.title}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status Filter */}
                <div>
                    <FormSelectField
                        control={control}
                        name="status_filter"
                        label="Status Filter"
                        options={[
                            {
                                label: "All Plans (Active & Archived)",
                                value: "all",
                            },
                            {
                                label: "Active Plans Only",
                                value: "active",
                            },
                            {
                                label: "Archived Plans Only",
                                value: "archived",
                            },
                            {
                                label: "Draft Plans",
                                value: "draft",
                            },
                        ]}
                    />
                </div>

                {/* Columns */}
                <div>
                    <h4 className="mb-3 text-sm font-semibold">
                        Data Columns to Include
                    </h4>

                    <div className="space-y-3 rounded-xl border p-4">
                        <FormSwitch
                            control={control}
                            name="plan_pricing"
                            label="Plan Details & Pricing"
                        />

                        <FormSwitch
                            control={control}
                            name="subscriber_revenue"
                            label="Subscriber Counts & Revenue (MRR)"
                        />

                        <FormSwitch
                            control={control}
                            name="usage_features"
                            label="Usage Limits & Features"
                        />

                        <FormSwitch
                            control={control}
                            name="history_log"
                            label="Historical Changes Log"
                        />
                    </div>
                </div>
            </div>
        </FormContainer>
    )
}