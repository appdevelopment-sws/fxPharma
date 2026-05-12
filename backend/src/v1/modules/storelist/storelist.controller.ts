import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { rootPrisma } from "@/lib/prisma.js";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";

type StoreStatus = "ACTIVE" | "INACTIVE";

type PermissionMeta = {
  key: string;
  name: string;
  description?: string | null;
};

type RoleMeta = {
  key: string;
  name: string;
  description?: string | null;
  permissions: PermissionMeta[];
};

type StoreListMeta = {
  roles: RoleMeta[];
  permissions: PermissionMeta[];
  defaultRoleKey: string;
};

type AddressPayload = {
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
};

const DEFAULT_ROLE_KEY = "ORG_ADMIN";
const DEFAULT_ROLE_SCOPE = "ORGANIZATION";

const toPermissionMeta = (permission: any): PermissionMeta => ({
  key: permission.key,
  name: permission.name,
  description: permission.description ?? null,
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getFirstValue = (
  value: string | string[] | undefined,
): string | undefined => (Array.isArray(value) ? value[0] : value);

const parseAddress = (address?: string | null): AddressPayload => {
  if (!address) return {};

  try {
    const parsed = JSON.parse(address) as AddressPayload;
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return { streetAddress: address };
  }
};

const serializeAddress = (address: AddressPayload) => JSON.stringify(address);

const getRoleTemplates = async (): Promise<RoleMeta[]> => {
  const roles = await rootPrisma.role.findMany({
    where: {
      isSystem: true,
      key: {
        not: "SUPER_ADMIN",
      },
    },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
    orderBy: [{ key: "asc" }, { createdAt: "asc" }],
  });

  return roles.map((role) => ({
    key: role.key,
    name: role.name,
    description: role.description ?? null,
    permissions: role.permissions.map((link) =>
      toPermissionMeta(link.permission),
    ),
  }));
};

const getStoreMeta = async (): Promise<StoreListMeta> => {
  const [roles, permissions] = await Promise.all([
    getRoleTemplates(),
    rootPrisma.permission.findMany({
      orderBy: { key: "asc" },
    }),
  ]);

  return {
    roles,
    permissions: permissions.map(toPermissionMeta),
    defaultRoleKey:
      roles.find((role) => role.key === DEFAULT_ROLE_KEY)?.key ??
      roles[0]?.key ??
      DEFAULT_ROLE_KEY,
  };
};

const getRoleTemplateByKey = async (roleKey?: string | null) => {
  const meta = await getStoreMeta();
  return (
    meta.roles.find((role) => role.key === (roleKey || DEFAULT_ROLE_KEY)) ??
    null
  );
};

const getPermissionKeys = async (
  roleKey?: string | null,
  submittedPermissions: string[] = [],
) => {
  const roleTemplate = await getRoleTemplateByKey(roleKey);
  if (submittedPermissions.length > 0) return submittedPermissions;
  return roleTemplate?.permissions.map((permission) => permission.key) ?? [];
};

const uniqueSlug = async (baseName: string, currentOrgId?: string) => {
  const baseSlug = slugify(baseName) || "store";
  let candidate = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await rootPrisma.organization.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === currentOrgId) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix++}`;
  }
};

const findMainBranch = (branches: any[]) =>
  branches.find((branch) => branch.isMainBranch) ?? branches[0] ?? null;

const getOwnerMembership = (members: any[]) =>
  members.find((member) => member.role?.key === DEFAULT_ROLE_KEY) ??
  members[0] ??
  null;

const mapOrganizationToStore = (organization: any) => {
  const mainBranch = findMainBranch(organization.branches ?? []);
  const address = parseAddress(mainBranch?.address);
  const ownerMembership = getOwnerMembership(organization.members ?? []);
  const owner = ownerMembership?.user;
  const role = ownerMembership?.role;
  const permissions =
    role?.permissions
      ?.filter((item: any) => item.permission)
      .map((item: any) => item.permission.key)
      .filter(Boolean) ?? [];

  return {
    id: organization.id,
    storeName: organization.name,
    description: organization.description ?? null,
    category: organization.category ?? null,
    logo: organization.logo ?? null,
    status: organization.isActive
      ? ("ACTIVE" as StoreStatus)
      : ("INACTIVE" as StoreStatus),
    roleKey: role?.key ?? DEFAULT_ROLE_KEY,
    roleName: role?.name ?? null,
    ownerFirstName:
      owner?.name?.split(" ")?.[0] ?? organization.ownerFirstName ?? "",
    ownerLastName:
      owner?.name?.split(" ")?.slice(1).join(" ") ??
      organization.ownerLastName ??
      "",
    ownerPhone: owner?.phone ?? organization.ownerPhone ?? "",
    ownerEmail: owner?.email ?? organization.ownerEmail ?? "",
    loginEmail: owner?.email ?? organization.ownerEmail ?? "",
    gstNo: organization.gstNo ?? null,
    licenseNo: organization.licenseNo ?? null,
    streetAddress: address.streetAddress ?? "",
    city: address.city ?? "",
    state: address.state ?? "",
    zipCode: address.zipCode ?? "",
    country: address.country ?? "",
    timezone: organization.timezone ?? null,
    currency: organization.currency ?? null,
    mainBranchId: mainBranch?.id ?? null,
    subscription_plan_id: organization.planId ?? null,
    plan: organization.plan
      ? {
          id: organization.plan.id,
          name: organization.plan.name,
          key: organization.plan.key,
          price: organization.plan.price,
          billing_type: organization.plan.billingCycle,
          max_staff_users: organization.plan.maxStaff,
          max_stores: organization.plan.maxBranches,
          isPopular: organization.plan.isPopular,
          badgeText: organization.plan.badgeText,
        }
      : null,
    permissions,
    isActive: organization.isActive,
    createdAt: organization.createdAt,
    updatedAt: organization.updatedAt,
    owner: owner
      ? {
          firstName: owner.name?.split(" ")?.[0] ?? "",
          lastName: owner.name?.split(" ")?.slice(1).join(" ") ?? "",
          email: owner.email,
          mobile: owner.phone,
          role: role
            ? {
                key: role.key,
                name: role.name,
              }
            : null,
          permissions: role?.permissions ?? [],
        }
      : null,
  };
};

const getOrganizationInclude = () =>
  ({
    plan: true,
    branches: true,
    members: {
      include: {
        user: true,
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    },
  }) as const;

const syncRolePermissions = async (
  tx: any,
  roleId: string,
  permissionKeys: string[],
) => {
  await tx.rolePermission.deleteMany({ where: { roleId } });

  if (!permissionKeys.length) return;

  const permissions = await tx.permission.findMany({
    where: { key: { in: permissionKeys } },
    select: { id: true },
  });

  await tx.rolePermission.createMany({
    data: permissions.map((permission: any) => ({
      roleId,
      permissionId: permission.id,
    })),
    skipDuplicates: true,
  });
};

const ensureRole = async (
  tx: any,
  organizationId: string,
  roleKey: string,
  roleName: string,
  permissionKeys: string[],
) => {
  const role = await tx.role.upsert({
    where: {
      organizationId_key: {
        organizationId,
        key: roleKey,
      },
    },
    update: {
      name: roleName,
      scope: roleKey === DEFAULT_ROLE_KEY ? DEFAULT_ROLE_SCOPE : "BRANCH",
      isSystem: true,
    },
    create: {
      organizationId,
      key: roleKey,
      name: roleName,
      scope: roleKey === DEFAULT_ROLE_KEY ? DEFAULT_ROLE_SCOPE : "BRANCH",
      isSystem: true,
    },
  });

  await syncRolePermissions(tx, role.id, permissionKeys);
  return role;
};

const buildOwnerName = (firstName: string, lastName: string) =>
  `${firstName} ${lastName}`.trim();

export class StoreListController {
  static meta = catchAsync(async (_req: Request, res: Response) => {
    const meta = await getStoreMeta();
    res.json({
      success: true,
      data: meta,
    });
  });

  static list = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, async (skip, take, search) => {
      const organizations = await rootPrisma.organization.findMany({
        include: getOrganizationInclude(),
        orderBy: { createdAt: "desc" },
      });

      const normalizedSearch = (search || "").trim().toLowerCase();

      const filtered = normalizedSearch
        ? organizations.filter((organization) => {
            const mainBranch = findMainBranch(organization.branches ?? []);
            const address = parseAddress(mainBranch?.address);
            const owner = getOwnerMembership(organization.members ?? [])?.user;

            return [
              organization.name,
              organization.slug,
              owner?.name,
              owner?.email,
              owner?.phone,
              address.city,
              address.state,
            ]
              .filter(Boolean)
              .some((value) =>
                String(value).toLowerCase().includes(normalizedSearch),
              );
          })
        : organizations;

      const data = filtered
        .slice(skip, skip + take)
        .map(mapOrganizationToStore);

      return { data, total: filtered.length };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const organization = await rootPrisma.organization.findUnique({
      where: { id: getFirstValue(req.params.id) ?? "" },
      include: getOrganizationInclude(),
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    res.json({ success: true, data: mapOrganizationToStore(organization) });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const requestedRoleKey =
      getFirstValue(req.body.roleKey) || DEFAULT_ROLE_KEY;
    const requestedPermissions = Array.isArray(req.body.permissions)
      ? req.body.permissions.filter(Boolean)
      : [];
    const roleTemplate = await getRoleTemplateByKey(requestedRoleKey);
    const permissionKeys =
      requestedPermissions.length > 0
        ? requestedPermissions
        : (roleTemplate?.permissions.map((permission) => permission.key) ?? []);

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const organizationSlug = await uniqueSlug(req.body.storeName);
    const displayRoleName =
      roleTemplate?.name ||
      (requestedRoleKey === DEFAULT_ROLE_KEY
        ? "Organization Admin"
        : requestedRoleKey);

    const created = await rootPrisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: req.body.storeName,
          slug: organizationSlug,
          planId: req.body.planId ?? null,
          isActive:
            req.body.isActive ??
            (req.body.status ? req.body.status === "ACTIVE" : true),
        },
      });

      const role = await ensureRole(
        tx,
        organization.id,
        requestedRoleKey,
        displayRoleName,
        permissionKeys,
      );

      const owner = await tx.user.create({
        data: {
          name: buildOwnerName(req.body.ownerFirstName, req.body.ownerLastName),
          email: req.body.ownerEmail ?? req.body.loginEmail,
          phone: req.body.ownerPhone,
          passwordHash,
          status: "ACTIVE",
          emailVerified: true,
        },
      });

      const member = await tx.organizationMember.create({
        data: {
          userId: owner.id,
          organizationId: organization.id,
          roleId: role.id,
          status: "ACTIVE",
        },
        include: {
          user: true,
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      await tx.branch.create({
        data: {
          organizationId: organization.id,
          name: `${req.body.storeName} Main Branch`,
          code: `${organizationSlug.slice(0, 12).toUpperCase()}-MAIN`,
          address: serializeAddress({
            streetAddress: req.body.streetAddress,
            city: req.body.city,
            state: req.body.state,
            zipCode: req.body.zipCode,
            country: req.body.country,
          }),
          phone: req.body.ownerPhone,
          email: req.body.ownerEmail ?? req.body.loginEmail,
          isMainBranch: true,
        },
      });

      return tx.organization.findUnique({
        where: { id: organization.id },
        include: getOrganizationInclude(),
      });
    });

    return res.status(201).json({
      success: true,
      data: mapOrganizationToStore(created),
    });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const organizationId = getFirstValue(req.params.id) ?? "";
    const existing = await rootPrisma.organization.findUnique({
      where: { id: organizationId },
      include: getOrganizationInclude(),
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const requestedRoleKey =
      getFirstValue(req.body.roleKey) || DEFAULT_ROLE_KEY;
    const requestedPermissions = Array.isArray(req.body.permissions)
      ? req.body.permissions.filter(Boolean)
      : [];
    const roleTemplate = await getRoleTemplateByKey(requestedRoleKey);
    const permissionKeys =
      requestedPermissions.length > 0
        ? requestedPermissions
        : (roleTemplate?.permissions.map((permission) => permission.key) ?? []);

    const updated = await rootPrisma.$transaction(async (tx) => {
      const organization = await tx.organization.update({
        where: { id: organizationId },
        data: {
          name: req.body.storeName ?? existing.name,
          planId: req.body.planId ?? existing.planId,
          isActive:
            req.body.isActive ??
            (req.body.status
              ? req.body.status === "ACTIVE"
              : existing.isActive),
        },
      });

      const role = await ensureRole(
        tx,
        organization.id,
        requestedRoleKey,
        roleTemplate?.name ||
          (requestedRoleKey === DEFAULT_ROLE_KEY
            ? "Organization Admin"
            : requestedRoleKey),
        permissionKeys,
      );

      const ownerMembership = getOwnerMembership(existing.members ?? []);
      if (ownerMembership) {
        await tx.user.update({
          where: { id: ownerMembership.userId },
          data: {
            name: buildOwnerName(
              req.body.ownerFirstName ??
                ownerMembership.user.name?.split(" ")?.[0] ??
                "",
              req.body.ownerLastName ??
                ownerMembership.user.name?.split(" ")?.slice(1).join(" ") ??
                "",
            ),
            email:
              req.body.ownerEmail ??
              req.body.loginEmail ??
              ownerMembership.user.email,
            phone: req.body.ownerPhone ?? ownerMembership.user.phone,
            ...(req.body.password
              ? {
                  passwordHash: await bcrypt.hash(req.body.password, 10),
                }
              : {}),
          },
        });

        await tx.organizationMember.update({
          where: {
            userId_organizationId: {
              userId: ownerMembership.userId,
              organizationId,
            },
          },
          data: {
            roleId: role.id,
            status: "ACTIVE",
          },
        });
      }

      const mainBranch = findMainBranch(existing.branches ?? []);
      if (mainBranch) {
        await tx.branch.update({
          where: { id: mainBranch.id },
          data: {
            name: req.body.storeName
              ? `${req.body.storeName} Main Branch`
              : mainBranch.name,
            address:
              req.body.streetAddress ||
              req.body.city ||
              req.body.state ||
              req.body.zipCode ||
              req.body.country
                ? serializeAddress({
                    streetAddress:
                      req.body.streetAddress ??
                      parseAddress(mainBranch.address).streetAddress ??
                      "",
                    city:
                      req.body.city ??
                      parseAddress(mainBranch.address).city ??
                      "",
                    state:
                      req.body.state ??
                      parseAddress(mainBranch.address).state ??
                      "",
                    zipCode:
                      req.body.zipCode ??
                      parseAddress(mainBranch.address).zipCode ??
                      "",
                    country:
                      req.body.country ??
                      parseAddress(mainBranch.address).country ??
                      "",
                  })
                : mainBranch.address,
            phone: req.body.ownerPhone ?? mainBranch.phone,
            email:
              req.body.ownerEmail ?? req.body.loginEmail ?? mainBranch.email,
          },
        });
      }

      return tx.organization.findUnique({
        where: { id: organization.id },
        include: getOrganizationInclude(),
      });
    });

    return res.json({
      success: true,
      data: mapOrganizationToStore(updated),
    });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    const organizationId = getFirstValue(req.params.id) ?? "";

    const existing = await rootPrisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    await rootPrisma.organization.delete({
      where: { id: organizationId },
    });

    res.json({ success: true, message: "Store deleted successfully" });
  });
}
