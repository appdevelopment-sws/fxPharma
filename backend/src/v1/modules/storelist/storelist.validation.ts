import { z } from "zod";

const storeStatusEnum = z.enum(["ACTIVE", "INACTIVE", "PENDING", "BLOCK"]);

export const createStoreSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  logo: z.string().optional(),
  status: storeStatusEnum.default("ACTIVE"),
  ownerFirstName: z.string().min(1, "Owner first name is required"),
  ownerLastName: z.string().min(1, "Owner last name is required"),
  ownerPhone: z.string().min(1, "Owner phone is required"),
  loginEmail: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  gstNo: z.string().optional(),
  licenseNo: z.string().optional(),
  streetAddress: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  planId: z.string().optional(),
});

export const updateStoreSchema = createStoreSchema.partial();
