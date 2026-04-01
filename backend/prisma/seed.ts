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

  const demoTenant = await prisma.tenant.upsert({
    where: { slug: "demo-pharmacy" },
    update: {
      name: "Demo Pharmacy",
      status: "ACTIVE",
      deletedAt: null,
    },
    create: {
      name: "Demo Pharmacy",
      slug: "demo-pharmacy",
      status: "ACTIVE",
    },
  });

  const adminRole = await prisma.role.upsert({
    where: {
      tenantId_name: {
        tenantId: demoTenant.id,
        name: "Admin",
      },
    },
    update: {
      description: "Tenant administrator with full tenant access",
      isDefault: true,
    },
    create: {
      tenantId: demoTenant.id,
      name: "Admin",
      description: "Tenant administrator with full tenant access",
      isDefault: true,
    },
  });

  const userRole = await prisma.role.upsert({
    where: {
      tenantId_name: {
        tenantId: demoTenant.id,
        name: "User",
      },
    },
    update: {
      description: "Default tenant user role",
      isDefault: true,
    },
    create: {
      tenantId: demoTenant.id,
      name: "User",
      description: "Default tenant user role",
      isDefault: true,
    },
  });

  const allPermissions = await prisma.permission.findMany();

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  const readPermission = allPermissions.find(
    (permission) => permission.name === "USER_READ",
  );

  if (readPermission) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: readPermission.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: readPermission.id,
      },
    });
  }

  await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: demoTenant.id,
        email: "admin@demo-pharmacy.com",
      },
    },
    update: {
      name: "Demo Admin",
      passwordHash,
      roleId: adminRole.id,
      status: "ACTIVE",
      deletedAt: null,
    },
    create: {
      tenantId: demoTenant.id,
      name: "Demo Admin",
      email: "admin@demo-pharmacy.com",
      passwordHash,
      roleId: adminRole.id,
      status: "ACTIVE",
    },
  });

  console.log("Seed completed for tenant demo-pharmacy");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
