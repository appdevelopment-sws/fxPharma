import { prisma } from "@/lib/prisma.js";
import { OrganizationType } from "@prisma/client";

export const listOrganizations = async () => {
  return prisma.organization.findMany({
    include: {
      _count: {
        select: { branches: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const findOrganizationById = async (id: string) => {
  return prisma.organization.findUnique({
    where: { id },
    include: {
      branches: true,
      features: {
        include: { feature: true },
      },
    },
  });
};

export const createOrganization = async (data: {
  name: string;
  type: OrganizationType;
}) => {
  return prisma.organization.create({
    data,
  });
};

export const updateOrganization = async (
  id: string,
  data: { name?: string; status?: number; type?: OrganizationType },
) => {
  return prisma.organization.update({
    where: { id },
    data,
  });
};

export const listBranchesByOrg = async (organizationId: string) => {
  return prisma.branch.findMany({
    where: { organizationId },
    include: {
      _count: {
        select: { userRoles: true },
      },
    },
  });
};

export const createBranch = async (data: {
  organizationId: string;
  name: string;
  address?: string;
}) => {
  return prisma.branch.create({
    data,
  });
};
