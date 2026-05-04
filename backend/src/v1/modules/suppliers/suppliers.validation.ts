import { z } from "zod";

export const createSupplierSchema = z.object({
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(255),
  gstNumber: z.string().length(15, "GST number must be exactly 15 characters"),
  officeAddress: z
    .string()
    .min(5, "Office address must be at least 5 characters"),
  registrationDocuments: z.string().optional().nullable(),

  contactPersonName: z
    .string()
    .min(2, "Contact person name must be at least 2 characters")
    .max(255),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15),
  whatsappNumber: z
    .string()
    .min(10, "Whatsapp number must be at least 10 digits")
    .max(15),

  isPreferred: z.boolean().optional(),
  autoGeneratePO: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();
