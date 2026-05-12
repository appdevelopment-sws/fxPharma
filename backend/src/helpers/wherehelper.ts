export function orgWhere(orgId: string) {
  return {
    organizationId: orgId,
  };
}

export function branchWhere(branchId: string) {
  return {
    branchId: branchId,
  };
}

export function orgAndBranchWhere(orgId: string, branchId: string) {
  return {
    organizationId: orgId,
    branchId: branchId,
  };
}
