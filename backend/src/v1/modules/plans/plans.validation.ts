import { z } from "zod";

export const createPlanSchema = z.object({
  key: z.string().min(3).max(50),
  name: z.string().min(3).max(100),
  shortDescription: z.string().max(255).optional(),
  description: z.array(z.string()).optional(),
  price: z.number().nonnegative(),
  currency: z.string().default("INR"),
  billingCycle: z.enum(["MONTHLY", "QUARTERLY", "YEARLY", "CUSTOM"]),
  durationDays: z.number().int().positive(),
  priceBreakdown: z.record(z.string(), z.any()).optional(),
  maxStaff: z.number().int().nonnegative().default(1),
  maxBranches: z.number().int().nonnegative().default(1),
  storageLimit: z.number().int().nonnegative().default(1024),
  advancedFeatures: z.record(z.string(), z.any()).optional(),
  isPopular: z.boolean().default(false),
  badgeText: z.string().max(50).optional(),
  status: z.number().int().default(1),
  featureIds: z.array(z.string()).optional(), // To link features during creation
});

export const updatePlanSchema = createPlanSchema.partial();
