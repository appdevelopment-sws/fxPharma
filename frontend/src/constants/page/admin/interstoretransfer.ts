import { FORM_TYPE } from "@/constants/shared/form";



export const INITIAL_STOCK_TRANSFER_FILTERS = {
    page: 1,
    perPage: 10,
    search: "",
    from_store: "",
    to_store: "",
    status: "",
};

export const STOCK_TRANSFER_COLUMNS = [
    { key: "serial", label: "#" },
    { key: "reference_no", label: "Reference No." },
    { key: "from_store", label: "From Store" },
    { key: "to_store", label: "To Store" },
    { key: "transfer_date", label: "Transfer Date" },
    { key: "items", label: "Items" },
    { key: "status", label: "Status" },
    { key: "action", label: "Actions" },
];

export const STOCK_TRANSFER_FORM_INITIAL_DATA = {
    id: "",

    /* Header Details */
    from_store: "Main Pharmacy (Downtown)",
    to_store: "",
    transfer_date: "Oct 24, 2023",
    reference_no: "TRF-8924",
    notes: "",

    /* Search */
    medicine_search: "",

    /* Items */
    items: [
        {
            medicine: "Amoxicillin 500mg",
            category: "Antibiotic",
            batch: "AMX-23A",
            expiry: "2025-10-15",
            available: 150,
            transfer_qty: 50,
        },
        {
            medicine: "Cetirizine 10mg",
            category: "Antihistamine",
            batch: "",
            expiry: "-",
            available: 0,
            transfer_qty: 0,
        },
    ],

    total_items: 2,
    total_quantity: 50,

    status: "DRAFT",
};

export const STORE_OPTIONS = [
    {
        label: "Main Pharmacy (Downtown)",
        value: "Main Pharmacy (Downtown)",
    },
    {
        label: "North Branch Store",
        value: "North Branch Store",
    },
    {
        label: "City Medical Outlet",
        value: "City Medical Outlet",
    },
];

export const BATCH_OPTIONS = [
    { label: "AMX-23A", value: "AMX-23A" },
    { label: "AMX-24B", value: "AMX-24B" },
    { label: "CET-10X", value: "CET-10X" },
];

export const TRANSFER_STATUS_OPTIONS = [
    { label: "Draft", value: "DRAFT" },
    { label: "Pending", value: "PENDING" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED" },
];

export const FORM_MODE = {
    CREATE: FORM_TYPE.CREATE,
    EDIT: FORM_TYPE.EDIT,
    VIEW: FORM_TYPE.VIEW,
};

export const TRANSFER_STATUS_COLORS = {
    DRAFT: "secondary",
    PENDING: "warning",
    COMPLETED: "success",
    CANCELLED: "danger",
};

export const STOCK_TRANSFER_SAMPLE_DATA = [
    {
        id: "1",
        reference_no: "TRF-8924",
        from_store: "Main Pharmacy (Downtown)",
        to_store: "North Branch Store",
        transfer_date: "2023-10-24",
        items: 2,
        status: "COMPLETED",
    },
    {
        id: "2",
        reference_no: "TRF-8925",
        from_store: "Main Pharmacy (Downtown)",
        to_store: "City Medical Outlet",
        transfer_date: "2023-10-25",
        items: 4,
        status: "PENDING",
    },
    {
        id: "3",
        reference_no: "TRF-8926",
        from_store: "North Branch Store",
        to_store: "Main Pharmacy (Downtown)",
        transfer_date: "2023-10-26",
        items: 1,
        status: "DRAFT",
    },
];