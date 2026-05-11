import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seed...");

  const passwordHash = await bcrypt.hash("SuperAdmin@123", 10);

  // 1. Define Permissions
  const permissions = [
    { key: "users.view", name: "View Users", description: "Can view users" },
    { key: "users.create", name: "Create Users", description: "Can create new users" },
    { key: "users.edit", name: "Edit Users", description: "Can edit existing users" },
    { key: "users.delete", name: "Delete Users", description: "Can delete users" },
    { key: "roles.view", name: "View Roles", description: "Can view roles" },
    { key: "roles.manage", name: "Manage Roles", description: "Can manage roles" },
    { key: "branches.view", name: "View Branches", description: "Can view branches" },
    { key: "branches.create", name: "Create Branches", description: "Can create new branches" },
    { key: "branches.edit", name: "Edit Branches", description: "Can edit existing branches" },
    { key: "branches.delete", name: "Delete Branches", description: "Can delete branches" },
    { key: "inventory.view", name: "View Inventory", description: "Can view inventory" },
    { key: "inventory.manage", name: "Manage Inventory", description: "Can manage inventory" },
    { key: "orders.view", name: "View Orders", description: "Can view orders" },
    { key: "orders.create", name: "Create Orders", description: "Can create new orders" },
    { key: "orders.manage", name: "Manage Orders", description: "Can manage orders" },
    { key: "medicine.view", name: "View Medicines", description: "Can view medicines" },
    { key: "medicine.manage", name: "Manage Medicines", description: "Can manage medicines" },
    { key: "organization.view", name: "View Organization", description: "Can view organization details" },
    { key: "organization.edit", name: "Edit Organization", description: "Can edit organization details" },
    { key: "master-products.view", name: "View Master Products", description: "Can view master products" },
    { key: "master-products.manage", name: "Manage Master Products", description: "Can manage master products" },
  ];

  console.log("Seeding permissions...");
  const createdPermissions = [];
  for (const p of permissions) {
    const permission = await prisma.permission.upsert({
      where: { key: p.key },
      update: { name: p.name, description: p.description },
      create: p,
    });
    createdPermissions.push(permission);
  }

  // 2. Create System Organization
  const systemOrg = await prisma.organization.upsert({
    where: { slug: "system" },
    update: {},
    create: {
      name: "System Administration",
      slug: "system",
    },
  });

  // 3. Create GLOBAL Super Admin Role
  const superAdminRole = await prisma.role.upsert({
    where: {
      organizationId_key: {
        organizationId: systemOrg.id,
        key: "SUPER_ADMIN",
      },
    },
    update: {},
    create: {
      organizationId: systemOrg.id,
      name: "Super Admin",
      key: "SUPER_ADMIN",
      scope: "GLOBAL",
      isSystem: true,
    },
  });

  // Link all permissions to Super Admin
  for (const p of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: p.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: p.id,
      },
    });
  }

  // 4. Create Superadmin User
  const superUser = await prisma.user.upsert({
    where: { email: "superadmin@dawadukaan.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@dawadukaan.com",
      passwordHash,
      status: "ACTIVE",
      emailVerified: true,
    },
  });

  // Link Superadmin to System Org
  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: superUser.id,
        organizationId: systemOrg.id,
      },
    },
    update: { roleId: superAdminRole.id },
    create: {
      userId: superUser.id,
      organizationId: systemOrg.id,
      roleId: superAdminRole.id,
      status: "ACTIVE",
    },
  });

  // 5. Create Demo Organization
  const demoOrg = await prisma.organization.upsert({
    where: { slug: "demo-pharmacy" },
    update: {},
    create: {
      name: "Demo Pharmacy",
      slug: "demo-pharmacy",
    },
  });

  // 6. Create Common Roles for Organizations
  const roleDefinitions = [
    {
      key: "ORG_ADMIN",
      name: "Organization Admin",
      scope: "ORGANIZATION" as const,
      permissions: permissions.map(p => p.key).filter(k => !k.startsWith("master-products")), // Can do everything except global master products
    },
    {
      key: "BRANCH_ADMIN",
      name: "Branch Admin",
      scope: "BRANCH" as const,
      permissions: ["users.view", "branches.view", "inventory.view", "inventory.manage", "orders.view", "orders.create", "orders.manage", "medicine.view"],
    },
    {
      key: "PHARMACIST",
      name: "Pharmacist",
      scope: "BRANCH" as const,
      permissions: ["inventory.view", "inventory.manage", "medicine.view"],
    },
    {
      key: "CASHIER",
      name: "Cashier",
      scope: "BRANCH" as const,
      permissions: ["orders.view", "orders.create"],
    },
  ];

  for (const rd of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: {
        organizationId_key: {
          organizationId: demoOrg.id,
          key: rd.key,
        },
      },
      update: { name: rd.name, scope: rd.scope },
      create: {
        organizationId: demoOrg.id,
        name: rd.name,
        key: rd.key,
        scope: rd.scope,
        isSystem: true,
      },
    });

    // Link permissions to role
    for (const pKey of rd.permissions) {
      const p = createdPermissions.find(cp => cp.key === pKey);
      if (p) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: p.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: p.id,
          },
        });
      }
    }
  }

  // 7. Create Org Admin User
  const orgAdminUser = await prisma.user.upsert({
    where: { email: "admin@demopharmacy.com" },
    update: {},
    create: {
      name: "Org Admin",
      email: "admin@demopharmacy.com",
      passwordHash,
      status: "ACTIVE",
      emailVerified: true,
    },
  });

  // Link Org Admin to Demo Org with ORG_ADMIN role
  const demoOrgAdminRole = await prisma.role.findUnique({
    where: {
      organizationId_key: {
        organizationId: demoOrg.id,
        key: "ORG_ADMIN",
      },
    },
  });

  if (demoOrgAdminRole) {
    await prisma.organizationMember.upsert({
      where: {
        userId_organizationId: {
          userId: orgAdminUser.id,
          organizationId: demoOrg.id,
        },
      },
      update: { roleId: demoOrgAdminRole.id },
      create: {
        userId: orgAdminUser.id,
        organizationId: demoOrg.id,
        roleId: demoOrgAdminRole.id,
        status: "ACTIVE",
      },
    });
  }

  // 8. Create Demo Branch
  const demoBranch = await prisma.branch.upsert({
    where: {
      organizationId_code: {
        organizationId: demoOrg.id,
        code: "BR001",
      },
    },
    update: {},
    create: {
      organizationId: demoOrg.id,
      name: "Main Branch",
      code: "BR001",
      address: "123 Pharmacy St, Medical City",
      phone: "1234567890",
      email: "branch1@demopharmacy.com",
      isMainBranch: true,
    },
  });

  // 9. Create Branch Admin User
  const branchAdminUser = await prisma.user.upsert({
    where: { email: "branchadmin@demopharmacy.com" },
    update: {},
    create: {
      name: "Branch Admin",
      email: "branchadmin@demopharmacy.com",
      passwordHash,
      status: "ACTIVE",
      emailVerified: true,
    },
  });

  // Link Branch Admin to Demo Org with BRANCH_ADMIN role
  const demoBranchAdminRole = await prisma.role.findUnique({
    where: {
      organizationId_key: {
        organizationId: demoOrg.id,
        key: "BRANCH_ADMIN",
      },
    },
  });

  if (demoBranchAdminRole) {
    const orgMember = await prisma.organizationMember.upsert({
      where: {
        userId_organizationId: {
          userId: branchAdminUser.id,
          organizationId: demoOrg.id,
        },
      },
      update: { roleId: demoBranchAdminRole.id },
      create: {
        userId: branchAdminUser.id,
        organizationId: demoOrg.id,
        roleId: demoBranchAdminRole.id,
        status: "ACTIVE",
      },
    });

    // Assign Branch Admin to the specific branch
    await prisma.memberBranch.upsert({
      where: {
        memberId_branchId: {
          memberId: orgMember.id,
          branchId: demoBranch.id,
        },
      },
      update: {},
      create: {
        memberId: orgMember.id,
        branchId: demoBranch.id,
      },
    });
  }

  console.log("Seed completed successfully!");
  console.log("Superadmin: superadmin@dawadukaan.com / SuperAdmin@123");
  console.log("Org Admin: admin@demopharmacy.com / SuperAdmin@123");
  console.log("Branch Admin: branchadmin@demopharmacy.com / SuperAdmin@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
