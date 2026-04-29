import { AsyncLocalStorage } from "node:async_hooks";

export type TenantContextState = {
  organizationId?: string;
  branchId?: string;
  userId?: string;
  bypassTenant?: boolean;
};

const tenantContext = new AsyncLocalStorage<TenantContextState>();

export const runWithTenantContext = <T>(
  state: TenantContextState,
  callback: () => T,
) => tenantContext.run(state, callback);

export const getTenantContext = () => tenantContext.getStore();

export const getOrganizationId = () => tenantContext.getStore()?.organizationId;
export const getBranchId = () => tenantContext.getStore()?.branchId;
export const getUserId = () => tenantContext.getStore()?.userId;

export const shouldBypassTenant = () =>
  tenantContext.getStore()?.bypassTenant === true;

export const runWithoutTenantScope = <T>(callback: () => T) => {
  const currentState = tenantContext.getStore();

  return tenantContext.run(
    {
      ...currentState,
      bypassTenant: true,
    },
    callback,
  );
};
