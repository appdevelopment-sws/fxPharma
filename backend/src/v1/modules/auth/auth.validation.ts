import { z } from "zod";

export const registerSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  companySlug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Company slug can only contain lowercase letters, numbers, and hyphens")
    .min(3)
    .max(50)
    .optional(),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/[0-9]/, "Password must include at least one number"),
});

export const loginSchema = z.object({
  tenantSlug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Tenant slug can only contain lowercase letters, numbers, and hyphens")
    .min(3)
    .max(50),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
