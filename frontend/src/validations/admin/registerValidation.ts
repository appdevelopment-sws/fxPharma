import { z } from "zod"

export const registerSchema = z
  .object({
    companyName: z
      .string()
      .min(2, "Company name must be at least 2 characters")
      .max(120, "Company name is too long"),

    companySlug: z
      .string()
      .min(3, "Workspace must be at least 3 characters")
      .max(50, "Workspace is too long")
      .regex(
        /^[a-z0-9-]+$/,
        "Workspace can only contain lowercase letters, numbers, and hyphens",
      ),

    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name is too long"),

    email: z.string().email("Invalid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include at least one uppercase letter")
      .regex(/[a-z]/, "Must include at least one lowercase letter")
      .regex(/[0-9]/, "Must include at least one number"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type RegisterSchema = z.infer<typeof registerSchema>
