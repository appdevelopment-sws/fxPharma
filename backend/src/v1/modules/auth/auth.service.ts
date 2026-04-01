import bcrypt from "bcryptjs";
import * as authRepository from "./auth.repository.js";

const formatUserPayload = (user: {
  id: string;
  tenantId: string;
  name: string;
  email: string;
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
  createdAt: user.createdAt,
});

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

export const register = async (data: {
  companyName: string;
  companySlug?: string;
  name: string;
  email: string;
  password: string;
}) => {
  const passwordHash = await bcrypt.hash(data.password, 12);
  const tenantSlug = slugify(data.companySlug || data.companyName);

  if (!tenantSlug) {
    throw new Error("Unable to generate a valid company slug");
  }

  const { tenant, user } = await authRepository.createTenantWithAdmin({
    tenant: {
      name: data.companyName.trim(),
      slug: tenantSlug,
    },
    adminUser: {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      passwordHash,
    },
  });

  return {
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status,
    },
    user: formatUserPayload(user),
  };
};

export const loginUser = async (
  tenantSlug: string,
  email: string,
  password: string,
) => {
  const tenant = await authRepository.findTenantBySlug(tenantSlug.trim().toLowerCase());

  if (!tenant || tenant.deletedAt) {
    throw new Error("Tenant not found");
  }

  if (tenant.status !== "ACTIVE") {
    throw new Error("Tenant access is currently disabled");
  }

  const user = await authRepository.findUserForLogin(
    tenant.id,
    email.trim().toLowerCase(),
  );

  if (!user || user.deletedAt) {
    throw new Error("Invalid credentials");
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
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status,
    },
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
