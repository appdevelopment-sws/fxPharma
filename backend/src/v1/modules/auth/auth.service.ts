import bcrypt from "bcryptjs";
import * as authRepository from "./auth.repository.js";

const formatUserPayload = (user: {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  tenant?: {
    id: string;
    name: string;
    status: string;
  };
  createdAt: Date;
  role: {
    name: string;
    permissions: Array<{
      permission: {
        name: string;
      };
    }>;
  };
}) => ({
  id: user.id,
  tenantId: user.tenantId,
  name: user.name,
  email: user.email,
  role: user.role.name,
  permissions: user.role.permissions.map(({ permission }) => permission.name),
  tenant: user.tenant
    ? {
        id: user.tenant.id,
        name: user.tenant.name,
        status: user.tenant.status,
      }
    : undefined,
  createdAt: user.createdAt,
});

export const register = async (data: {
  companyName: string;
  name: string;
  email: string;
  password: string;
}) => {
  const passwordHash = await bcrypt.hash(data.password, 12);

  const { tenant, user } = await authRepository.createTenantWithAdmin({
    tenant: {
      name: data.companyName.trim(),
    },
    adminUser: {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      passwordHash,
    },
  });

  return {
    user: formatUserPayload(user),
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await authRepository.findUserForLogin(email.trim().toLowerCase());

  if (!user || user.deletedAt) {
    throw new Error("Invalid credentials");
  }

  if (!user.tenant) {
    throw new Error("Tenant not found");
  }

  if (user.tenant.deletedAt) {
    throw new Error("Tenant not found");
  }

  if (user.tenant.status !== "ACTIVE") {
    throw new Error("Tenant access is currently disabled");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("User access is currently disabled");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    throw new Error("Invalid credentials");
  }

  return {
    ...formatUserPayload(user),
  };
};

export const getUserById = async (id: string) => {
  const user = await authRepository.findUserById(id);

  if (!user || user.deletedAt) {
    throw new Error("User not found");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("User access is currently disabled");
  }

  return formatUserPayload(user);
};
