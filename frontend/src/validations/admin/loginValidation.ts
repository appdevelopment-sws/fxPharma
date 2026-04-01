import { z } from "zod"

export const loginSchema = z.object({
  tenantSlug: z
    .string()
    .min(3, "Workspace must be at least 3 characters")
    .max(50, "Workspace is too long")
    .regex(
      /^[a-z0-9-]+$/,
      "Workspace can only contain lowercase letters, numbers, and hyphens",
    ),

  email: z.string().email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[a-z]/, "Must include at least one lowercase letter")
    .regex(/[0-9]/, "Must include at least one number"),
})

export type loginSchema = z.infer<typeof loginSchema>
