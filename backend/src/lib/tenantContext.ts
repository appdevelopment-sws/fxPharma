import { AsyncLocalStorage } from "node:async_hooks";

export type TenantContextState = {
  tenantId?: string;
  bypassTenant?: boolean;
};

const tenantContext = new AsyncLocalStorage<TenantContextState>();

export const runWithTenantContext = <T>(
  state: TenantContextState,
  callback: () => T,
) => tenantContext.run(state, callback);

export const getTenantContext = () => tenantContext.getStore();

export const getTenantId = () => tenantContext.getStore()?.tenantId;

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
