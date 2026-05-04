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

  // 2. Seed Features (Core Modules & Add-ons)
  const featuresData = [
    { key: "inventory", name: "Inventory Management", module: "Core" },
    { key: "billing", name: "Billing & Invoicing", module: "Core" },
    { key: "rack_system", name: "Rack & Shelf Management", module: "Core" },
    { key: "gst_ledger", name: "GST Ledger & Reports", module: "Core" },
    { key: "analytics", name: "Business Analytics", module: "Advanced" },
    { key: "whatsapp_alerts", name: "WhatsApp Alerts", module: "Add-on" },
    { key: "white_labeling", name: "White Labeling", module: "Enterprise" },
    { key: "api_access", name: "API Access", module: "Enterprise" },
  ];

  console.log("Seeding features...");
  const seededFeatures = await Promise.all(
    featuresData.map((f) =>
      prisma.feature.upsert({
        where: { key: f.key },
        update: { name: f.name, module: f.module },
        create: f,
      }),
    ),
  );

  // 3. Seed Plans (Starter, Professional, Enterprise)
  console.log("Seeding plans...");

  // A. STARTER PLAN
  const starterPlan = await prisma.plan.upsert({
    where: { key: "STARTER_MONTHLY" },
    update: {},
    create: {
      key: "STARTER_MONTHLY",
      name: "Starter Pack",
      shortDescription: "Ideal for small single-store pharmacies",
      description: [
        "Basic Inventory",
        "Billing",
        "1 Branch Only",
        "Limited Support",
      ],
      price: 999,
      billingCycle: "MONTHLY",
      durationDays: 30,
      maxStaff: 2,
      maxBranches: 1,
      storageLimit: 512,
      isPopular: false,
      badgeText: "Budget Friendly",
      status: 1,
    },
  });

  // B. PROFESSIONAL PLAN
  const proPlan = await prisma.plan.upsert({
    where: { key: "PRO_MONTHLY" },
    update: {},
    create: {
      key: "PRO_MONTHLY",
      name: "Growth Plan",
      shortDescription: "Best for growing pharmacy chains",
      description: [
        "Advanced Inventory",
        "Rack System",
        "GST Reports",
        "Up to 5 Branches",
      ],
      price: 2499,
      billingCycle: "MONTHLY",
      durationDays: 30,
      maxStaff: 10,
      maxBranches: 5,
      storageLimit: 2048,
      isPopular: true,
      badgeText: "Most Popular",
      status: 1,
      advancedFeatures: {
        apiAccess: true,
        prioritySupport: true,
      },
      priceBreakdown: {
        base: 2117,
        gst: 382,
      },
    },
  });

  // C. ENTERPRISE PLAN
  const enterprisePlan = await prisma.plan.upsert({
    where: { key: "ENTERPRISE_YEARLY" },
    update: {},
    create: {
      key: "ENTERPRISE_YEARLY",
      name: "Enterprise Solution",
      shortDescription: "Full-scale solution for large enterprises",
      description: [
        "Everything in Pro",
        "White Labeling",
        "Dedicated Manager",
        "Unlimited Branches",
      ],
      price: 25000,
      billingCycle: "YEARLY",
      durationDays: 365,
      maxStaff: 100,
      maxBranches: 100,
      storageLimit: 10240,
      isPopular: false,
      badgeText: "Best Value",
      status: 1,
      advancedFeatures: {
        apiAccess: true,
        whiteLabeling: true,
        prioritySupport: true,
        dedicatedAccountManager: true,
      },
    },
  });

  // 4. Link Features to Plans
  const planFeatureLinks = [
    // Starter Features
    { planId: starterPlan.id, featureKey: "inventory" },
    { planId: starterPlan.id, featureKey: "billing" },

    // Pro Features (Starter + More)
    { planId: proPlan.id, featureKey: "inventory" },
    { planId: proPlan.id, featureKey: "billing" },
    { planId: proPlan.id, featureKey: "rack_system" },
    { planId: proPlan.id, featureKey: "gst_ledger" },
    { planId: proPlan.id, featureKey: "analytics" },

    // Enterprise Features (All)
    { planId: enterprisePlan.id, featureKey: "inventory" },
    { planId: enterprisePlan.id, featureKey: "billing" },
    { planId: enterprisePlan.id, featureKey: "rack_system" },
    { planId: enterprisePlan.id, featureKey: "gst_ledger" },
    { planId: enterprisePlan.id, featureKey: "analytics" },
    { planId: enterprisePlan.id, featureKey: "whatsapp_alerts" },
    { planId: enterprisePlan.id, featureKey: "white_labeling" },
    { planId: enterprisePlan.id, featureKey: "api_access" },
  ];

  for (const link of planFeatureLinks) {
    const feature = seededFeatures.find((f) => f.key === link.featureKey);
    if (feature) {
      await prisma.planFeature.upsert({
        where: {
          planId_featureId: { planId: link.planId, featureId: feature.id },
        },
        update: {},
        create: { planId: link.planId, featureId: feature.id },
      });
    }
  }

  // 5. Seed Permissions
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

  // 6. Seed Workflows
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

  // 7. Seed Roles
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

  // 8. Create Platform User (Super Admin)
  console.log("Creating super admin user...");
  const hashedPassword = await bcrypt.hash("SuperAdmin@123", 12);
  const superAdminUser = await prisma.user.upsert({
    where: { email: "superadmin@platform.com" },
    update: { password: hashedPassword },
    create: {
      email: "superadmin@platform.com",
      firstName: "Platform",
      lastName: "Super Admin",
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
          scopeId: "global_scope",
        },
      },
      update: {},
      create: {
        userId: superAdminUser.id,
        roleId: superAdminRole.id,
        scopeType: "global",
      },
    })
    .catch(() => {});

  // 9. Create Example Organization and Branch
  console.log("Creating example organization...");
  const org = await prisma.organization.create({
    data: {
      status: "ACTIVE",
      storeName: "HealthCare Pharmacy Solutions",
      streetAddress: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",

      ownerId: superAdminUser.id,

      planId: proPlan.id, // Linking to Pro Plan
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

  // 10. Create Branch Admin User
  console.log("Creating branch admin user...");
  const branchAdminUser = await prisma.user.upsert({
    where: { email: "admin@healthcare.com" },
    update: { password: hashedPassword },
    create: {
      email: "admin@healthcare.com",
      firstName: "Healthcare Admin",
      lastName: " Admin",
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
