import { FORM_TYPE } from "@/constants/shared/form";

export const MASTER_PRODUCT_BREADCRUMBS = [
  { title: "Products Directory", href: "/super-admin/master-products" },
  { title: "Master Products", href: "/super-admin/master-products" },
];

export const INITIAL_PRODUCT_FILTERS = {
  page: 1,
  limit: 10,
  search: "",
  companyId: "",
  productTypeId: "",
  hsnCodeId: "",
};

export const MASTER_PRODUCT_COLUMNS = [
  { key: "serial", label: "#" },
  { key: "name", label: "Product Name" },
  { key: "salt", label: "Salt Composition" },
  { key: "company", label: "Company" },
  { key: "product_type", label: "Type" },
  { key: "hsn", label: "HSN Code" },
  { key: "action", label: "Actions" },
];

export const MASTER_PRODUCT_FORM_INITIAL_DATA = {
  name: "",
  salt: "",
  brand_name: "",
  barcode: "",
  pack_size: "",
  strength: "",
  company_id: "",
  product_type_id: "",
  hsnCodeId: "",
};

export const MASTER_PRODUCT_DIALOG_FORM_LAYOUT = [
  {
    name: "name",
    label: "Product Name",
    type: FORM_TYPE.TEXT,
    placeholder: "e.g. Paracetamol 500mg",
    tooltip: "Primary master-product name.",
    required: true,
  },
  {
    name: "salt",
    label: "Salt",
    type: FORM_TYPE.TEXT,
    placeholder: "e.g. Acetaminophen",
    tooltip: "Generic salt or active composition.",
    required: true,
  },
  {
    name: "brand_name",
    label: "Brand Name",
    type: FORM_TYPE.TEXT,
    placeholder: "e.g. Crocin",
  },
  {
    name: "barcode",
    label: "Barcode",
    type: FORM_TYPE.TEXT,
    placeholder: "e.g. 8901234567890",
  },
  {
    name: "pack_size",
    label: "Pack Size",
    type: FORM_TYPE.TEXT,
    placeholder: "e.g. 10 tablets",
  },
  {
    name: "strength",
    label: "Strength",
    type: FORM_TYPE.TEXT,
    placeholder: "e.g. 500mg",
  },
];

export const MASTER_PRODUCT_REFERENCE_FORM_LAYOUT = [
  {
    name: "company_id",
    label: "Company ID",
    type: FORM_TYPE.NUMBER,
    placeholder: "e.g. 1",
    required: true,
  },
  {
    name: "product_type_id",
    label: "Product Type ID",
    type: FORM_TYPE.NUMBER,
    placeholder: "e.g. 2",
    required: true,
  },
  {
    name: "hsnCodeId",
    label: "HSN Code ID",
    type: FORM_TYPE.NUMBER,
    placeholder: "e.g. 3",
    required: true,
  },
];
