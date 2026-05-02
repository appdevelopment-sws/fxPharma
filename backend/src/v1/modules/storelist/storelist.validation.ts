import { z } from "zod";

export const createStoreListSchema = z.object({
  storeName: z.string().min(2).max(200),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  status: z.boolean().optional(),
  ownerFirstName: z.string().min(1),
  ownerLastName: z.string().min(1),
  ownerEmail: z.string().email(),
  ownerPhone: z.string().min(10),
  loginEmail: z.string().email(),
  password: z.string().min(6),
  gstNo: z.string().optional().nullable(),
  licenseNo: z.string().optional().nullable(),
  streetAddress: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
  timezone: z.string().optional().nullable(),
  currency: z.string().optional().nullable(),
  planId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateStoreListSchema = createStoreListSchema.partial();
