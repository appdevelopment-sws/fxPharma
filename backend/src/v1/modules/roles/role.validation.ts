import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(1),
  key: z.string().optional(),
  description: z.string().optional(),
  //   organizationId: z.string().optional(),
  //   scope: z.enum(["GLOBAL", "ORGANIZATION", "BRANCH"]).optional(),
  permissions: z.array(z.string()).optional(),
  isSystem: z.boolean().optional(),
});

export const updateRoleSchema = createRoleSchema.partial();

export default {};
