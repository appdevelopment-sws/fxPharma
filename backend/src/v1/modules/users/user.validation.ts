import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1).max(150),
  email: z.string().email(),
  password: z.string().min(8),
  organizationId: z.string().min(1),
  roleId: z.string().min(1),
  branchId: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  organizationId: z.string().min(1).optional(),
  roleId: z.string().min(1).optional(),
  branchId: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INVITED", "SUSPENDED", "DISABLED"]).optional(),
});
