import { rootPrisma } from "@/lib/prisma.js";

export const resolveOrganizationIdFromBranch = async (
  branchId?: string | null,
) => {
  if (!branchId) return null;

  const branch = await rootPrisma.branch.findUnique({
    where: { id: branchId },
    select: { organizationId: true },
  });

  return branch?.organizationId ?? null;
};
