// masterProduct.constants.ts

export const PRODUCT_FORM_INITIAL_DATA = {
  name: "",
  generic_name: "",
  brand_name: "",
  pack_size: "",
  strength: "",
  scheduleType: "",
  isPrescriptionRequired: false,
  company_id: "",
  product_type_id: "",
  hsnCodeId: "",
}

export const PRODUCT_FORM_LAYOUT = [
  {
    name: "name",
    label: "Product Name",
    type: FORM_TYPE.TEXT,
    required: true,
    placeholder: "Paracetamol 500",
  },
  {
    name: "generic_name",
    label: "Generic Name",
    type: FORM_TYPE.TEXT,
  },
  {
    name: "brand_name",
    label: "Brand Name",
    type: FORM_TYPE.TEXT,
  },
  {
    name: "strength",
    label: "Strength",
    type: FORM_TYPE.TEXT,
  },
  {
    name: "pack_size",
    label: "Pack Size",
    type: FORM_TYPE.TEXT,
  },
  {
    name: "scheduleType",
    label: "Schedule Type",
    type: FORM_TYPE.TEXT,
  },
]

export const PRODUCT_REFERENCE_LAYOUT = [
  {
    name: "company_id",
    label: "Company",
    type: FORM_TYPE.SELECT,
    optionsKey: "companies",
    required: true,
  },
  {
    name: "product_type_id",
    label: "Product Type",
    type: FORM_TYPE.SELECT,
    optionsKey: "productTypes",
    required: true,
  },
  {
    name: "hsnCodeId",
    label: "HSN Code",
    type: FORM_TYPE.SELECT,
    optionsKey: "hsnCodes",
    required: true,
    allowCreate: true,
  },
]

export const PRODUCT_EXTRA_LAYOUT = [
  {
    name: "isPrescriptionRequired",
    label: "Prescription required",
    type: FORM_TYPE.CHECKBOX,
  },
]
