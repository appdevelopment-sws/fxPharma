import { z } from "zod";

const branchStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const createBranchSchema = z.object({
  branch_name: z.string().min(2).max(150),
  code: z.string().max(50).optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  status: branchStatusSchema.optional(),
  isMainBranch: z.boolean().optional(),
});

export const updateBranchSchema = createBranchSchema.partial();
