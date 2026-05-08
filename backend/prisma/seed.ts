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

  // 1. Create System Organization (for Superadmins)
  const systemOrg = await prisma.organization.upsert({
    where: { slug: "system" },
    update: {},
    create: {
      name: "System Administration",
      slug: "system",
    },
  });

  // 2. Create GLOBAL Super Admin Role
  // Note: For global roles, organizationId is null
  const superAdminRole = await prisma.role.upsert({
    where: {
      organizationId_key: {
        organizationId: systemOrg.id, // Linking it to system org for now to avoid null unique issues if any
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

  // 3. Create Superadmin User
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

  // 4. Link Superadmin to System Org
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

  // 6. Create ORG_ADMIN Role for Demo Org
  const orgAdminRole = await prisma.role.upsert({
    where: {
      organizationId_key: {
        organizationId: demoOrg.id,
        key: "ORG_ADMIN",
      },
    },
    update: {},
    create: {
      organizationId: demoOrg.id,
      name: "Organization Admin",
      key: "ORG_ADMIN",
      scope: "ORGANIZATION",
      isSystem: true,
    },
  });

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

  // 8. Link Org Admin to Demo Org
  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: orgAdminUser.id,
        organizationId: demoOrg.id,
      },
    },
    update: { roleId: orgAdminRole.id },
    create: {
      userId: orgAdminUser.id,
      organizationId: demoOrg.id,
      roleId: orgAdminRole.id,
      status: "ACTIVE",
    },
  });

  console.log("Seed completed successfully!");
  console.log("Superadmin: superadmin@dawadukaan.com / admin123");
  console.log("Org Admin: admin@demopharmacy.com / admin123");
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
