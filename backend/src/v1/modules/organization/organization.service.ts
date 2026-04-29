import * as organizationRepository from "./organization.repository.js";
import { OrganizationType } from "@prisma/client";

export const getAllOrganizations = async () => {
  return organizationRepository.listOrganizations();
};

export const getOrganization = async (id: string) => {
  const org = await organizationRepository.findOrganizationById(id);
  if (!org) throw new Error("Organization not found");
  return org;
};

export const createNewOrganization = async (data: {
  name: string;
  type: OrganizationType;
}) => {
  return organizationRepository.createOrganization(data);
};

export const updateExistingOrganization = async (
  id: string,
  data: { name?: string; status?: number; type?: OrganizationType },
) => {
  return organizationRepository.updateOrganization(id, data);
};

export const getBranches = async (orgId: string) => {
  return organizationRepository.listBranchesByOrg(orgId);
};

export const createNewBranch = async (data: {
  organizationId: string;
  name: string;
  address?: string;
}) => {
  // Check if org exists
  await getOrganization(data.organizationId);
  return organizationRepository.createBranch(data);
};
