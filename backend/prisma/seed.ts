import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("supersecurepassword", 12);

  const permissions = [
    { name: "USER_CREATE", description: "Create tenant users" },
    { name: "USER_READ", description: "Read tenant users" },
    { name: "USER_UPDATE", description: "Update tenant users" },
    { name: "USER_DELETE", description: "Delete tenant users" },
    { name: "ROLE_MANAGE", description: "Manage tenant roles" },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {
        description: permission.description,
      },
      create: permission,
    });
  }

  let platformTenant = await prisma.tenant.findFirst({
    where: {
      name: "Platform",
      deletedAt: null,
    },
  });

  if (!platformTenant) {
    platformTenant = await prisma.tenant.create({
      data: {
        name: "Platform",
        status: "ACTIVE",
      },
    });
  } else {
    platformTenant = await prisma.tenant.update({
      where: { id: platformTenant.id },
      data: {
        status: "ACTIVE",
        deletedAt: null,
      },
    });
  }

  const superAdminRole = await prisma.role.upsert({
    where: {
      tenantId_name: {
        tenantId: platformTenant.id,
        name: "Super Admin",
      },
    },
    update: {
      description: "Platform super administrator",
      isDefault: true,
    },
    create: {
      tenantId: platformTenant.id,
      name: "Super Admin",
      description: "Platform super administrator",
      isDefault: true,
    },
  });

  const allPermissions = await prisma.permission.findMany();

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  const superAdminEmail = "superadmin@platform.local";

  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      tenantId: platformTenant.id,
      email: superAdminEmail,
    },
  });

  if (existingSuperAdmin) {
    await prisma.user.update({
      where: { id: existingSuperAdmin.id },
      data: {
        tenantId: platformTenant.id,
        name: "Super Admin",
        email: superAdminEmail,
        passwordHash,
        roleId: superAdminRole.id,
        status: "ACTIVE",
        deletedAt: null,
      },
    });
  } else {
    await prisma.user.create({
      data: {
        tenantId: platformTenant.id,
        name: "Super Admin",
        email: superAdminEmail,
        passwordHash,
        roleId: superAdminRole.id,
        status: "ACTIVE",
      },
    });
  }

  console.log("Seed completed with super admin email: superadmin@platform.local");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
