// constants/formTypes.ts

export const FORM_TYPE = {
  TEXT: "text",
  TEXTAREA: "textarea",
  SELECT: "select",
  CHECKBOX: "checkbox",
  RADIO: "radio",
  MULTI_SELECT: "multi-select",
  DATETIME: "datetime",
} as const

export type FormType = (typeof FORM_TYPE)[keyof typeof FORM_TYPE]
