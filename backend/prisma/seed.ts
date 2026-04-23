import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seed...");

  // 1. Clear existing data (optional but helpful for development with force-reset)
  // Note: db push --force-reset handles this at the DB level usually.

  // 2. Seed Permissions
  const permissionsData = [
    { key: "users.create", module: "Users" },
    { key: "users.view", module: "Users" },
    { key: "users.edit", module: "Users" },
    { key: "users.delete", module: "Users" },
    { key: "roles.manage", module: "Access Control" },
    { key: "workflows.manage", module: "Access Control" },
    { key: "inventory.view", module: "Inventory" },
    { key: "inventory.manage", module: "Inventory" },
    { key: "sales.create", module: "Sales" },
    { key: "sales.view", module: "Sales" },
    { key: "organizations.manage", module: "Platform" },
  ];

  console.log("Seeding permissions...");
  const permissions = await Promise.all(
    permissionsData.map((p) =>
      prisma.permission.upsert({
        where: { key: p.key },
        update: { module: p.module },
        create: p,
      }),
    ),
  );

  // 3. Seed Workflows
  console.log("Seeding workflows...");
  const adminWorkflow = await prisma.workflow.upsert({
    where: { key: "admin_workflow" },
    update: {},
    create: {
      key: "admin_workflow",
      name: "Full Administrative Access",
      description: "Grants all permissions in the system.",
    },
  });

  // Link all permissions to admin workflow
  await Promise.all(
    permissions.map((p) =>
      prisma.workflowPermission.upsert({
        where: {
          workflowId_permissionId: {
            workflowId: adminWorkflow.id,
            permissionId: p.id,
          },
        },
        update: {},
        create: {
          workflowId: adminWorkflow.id,
          permissionId: p.id,
        },
      }),
    ),
  );

  const staffWorkflow = await prisma.workflow.upsert({
    where: { key: "staff_workflow" },
    update: {},
    create: {
      key: "staff_workflow",
      name: "Staff Access",
      description: "Basic access for branch staff.",
    },
  });

  // Link basic permissions to staff workflow
  const staffPermissionKeys = ["inventory.view", "sales.create", "sales.view"];
  const staffPermissions = permissions.filter((p) =>
    staffPermissionKeys.includes(p.key),
  );

  await Promise.all(
    staffPermissions.map((p) =>
      prisma.workflowPermission.upsert({
        where: {
          workflowId_permissionId: {
            workflowId: staffWorkflow.id,
            permissionId: p.id,
          },
        },
        update: {},
        create: {
          workflowId: staffWorkflow.id,
          permissionId: p.id,
        },
      }),
    ),
  );

  // 4. Seed Roles
  console.log("Seeding roles...");
  const superAdminRole = await prisma.role.upsert({
    where: { key: "super_admin" },
    update: { level: 100, scopeType: "global" },
    create: {
      key: "super_admin",
      name: "Super Administrator",
      level: 100,
      scopeType: "global",
    },
  });

  const branchAdminRole = await prisma.role.upsert({
    where: { key: "branch_admin" },
    update: { level: 50, scopeType: "branch" },
    create: {
      key: "branch_admin",
      name: "Branch Administrator",
      level: 50,
      scopeType: "branch",
    },
  });

  const staffRole = await prisma.role.upsert({
    where: { key: "staff" },
    update: { level: 10, scopeType: "branch" },
    create: {
      key: "staff",
      name: "Staff Member",
      level: 10,
      scopeType: "branch",
    },
  });

  // 5. Create Platform User (Super Admin)
  console.log("Creating super admin user...");
  const hashedPassword = await bcrypt.hash("  ", 12);
  const superAdminUser = await prisma.user.upsert({
    where: { email: "superadmin@platform.com" },
    update: { password: hashedPassword },
    create: {
      email: "superadmin@platform.com",
      name: "Platform Super Admin",
      password: hashedPassword,
      status: 1,
    },
  });

  // Assign Super Admin Role (GLOBAL)
  await prisma.userRole
    .upsert({
      where: {
        userId_roleId_scopeId: {
          userId: superAdminUser.id,
          roleId: superAdminRole.id,
          scopeId: "global_scope", // Specific string or null for global. Using null is cleaner if schema allows.
        },
      },
      update: {},
      create: {
        userId: superAdminUser.id,
        roleId: superAdminRole.id,
        scopeType: "global",
        // scopeId remains null for global roles
      },
    })
    .catch(() => {
      // If we use null in unique constraint, we might need a different approach.
      // However, our schema allows null scopeId in the unique constraint [userId, roleId, scopeId].
    });

  // 6. Create Example Organization and Branch
  console.log("Creating example organization...");
  const org = await prisma.organization.create({
    data: {
      name: "HealthCare Pharmacy Solutions",
      status: 1,
      branches: {
        create: [
          { name: "Downtown Branch", status: 1 },
          { name: "Westside Branch", status: 1 },
        ],
      },
    },
    include: { branches: true },
  });

  const mainBranch = org.branches[0];

  // 7. Create Branch Admin User
  console.log("Creating branch admin user...");
  const branchAdminUser = await prisma.user.upsert({
    where: { email: "admin@healthcare.com" },
    update: { password: hashedPassword },
    create: {
      email: "admin@healthcare.com",
      name: "Healthcare Admin",
      password: hashedPassword,
      status: 1,
    },
  });

  // Assign Branch Admin Role for Downtown Branch
  await prisma.userRole.create({
    data: {
      userId: branchAdminUser.id,
      roleId: branchAdminRole.id,
      scopeType: "branch",
      scopeId: mainBranch.id,
    },
  });

  // Assign Staff Workflow for Westside Branch (Direct Workflow Assignment)
  await prisma.userWorkflow.create({
    data: {
      userId: branchAdminUser.id,
      workflowId: staffWorkflow.id,
      scopeType: "branch",
      scopeId: org.branches[1].id,
    },
  });

  console.log("Seed completed successfully!");
}
//@ts-ignore
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
