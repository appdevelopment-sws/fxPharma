export const FORM_TYPE = {
  TEXT: "text",
  TEXTAREA: "textarea",
  SELECT: "select",
  RADIO: "radio",
  CHECKBOX: "checkbox",
  NUMBER: "number",
  DATETIME: "datetime",
  MULTI_SELECT: "multi_select",
  PASSWORD: "password",
  EMAIL: "email",
} as const

export type FormType = (typeof FORM_TYPE)[keyof typeof FORM_TYPE]
