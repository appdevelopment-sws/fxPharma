import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("supersecurepassword", 10);

  // 🔑 Permissions
  const permissions = [
    { name: "USER_CREATE" },
    { name: "USER_READ" },
    { name: "USER_UPDATE" },
    { name: "USER_DELETE" },
    { name: "ROLE_MANAGE" },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  // 🔑 Roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: "Super Admin" },
    update: {},
    create: {
      name: "Super Admin",
      description: "Full access",
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: {
      name: "Admin",
      description: "Admin access",
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "User" },
    update: {},
    create: {
      name: "User",
      description: "Default user role",
    },
  });

  // 🔗 Assign permissions to roles

  const allPermissions = await prisma.permission.findMany();

  // Super Admin → all permissions
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // Admin → limited permissions
  const adminPerms = allPermissions.filter((p) =>
    ["USER_CREATE", "USER_READ", "USER_UPDATE"].includes(p.name),
  );

  for (const perm of adminPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // User → minimal permissions
  const userPerms = allPermissions.filter((p) =>
    ["USER_READ"].includes(p.name),
  );

  for (const perm of userPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: perm.id,
      },
    });
  }

  // 👑 Super Admin user
  await prisma.user.upsert({
    where: { email: "superadmin@example.com" },
    update: {},
    create: {
      email: "superadmin@example.com",
      passwordHash,
      roleId: superAdminRole.id,
    },
  });

  console.log("✅ Seed completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
