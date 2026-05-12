import { z } from "zod";

const ingredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  type: z.string().optional().nullable(),
  quantity: z.union([z.number(), z.string()]).optional().nullable(),
  unit: z.string().optional().nullable(),
});

export const createCompoundSchema = z.object({
  name: z.string().min(2, "Compound name must be at least 2 characters"),
  dosageForm: z.string().optional().nullable(),
  totalQty: z.number().optional().nullable(),
  totalQtyUnit: z.string().optional().nullable(),
  daysSupply: z.number().int().optional().nullable(),
  budValue: z.number().int().optional().nullable(),
  budUnit: z.string().optional().nullable(),

  patientId: z.string().optional().nullable(),
  providerId: z.string().optional().nullable(),

  instructions: z.string().optional().nullable(),
  sig: z.string().optional().nullable(),

  requiresHomogenizer: z.boolean().optional(),
  requiresUnguator: z.boolean().optional(),
  isLightSensitive: z.boolean().optional(),

  ingredients: z.array(ingredientSchema).optional(),
});

export const updateCompoundSchema = createCompoundSchema.partial();
