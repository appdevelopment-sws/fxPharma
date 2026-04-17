import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma, rootPrisma } from "@/lib/prisma.js";

type DbClient = PrismaClient | Prisma.TransactionClient;

const userWithRelations = {
  include: {
    roles: {
      include: {
        role: true,
        branch: true,
      },
    },
    workflows: {
      include: {
        workflow: true,
        branch: true,
      },
    },
    permissions: {
      include: {
        permission: true,
        branch: true,
      },
    },
  },
} as const;

export const findUserForLogin = async (email: string) => {
  return rootPrisma.user.findFirst({
    where: {
      email,
    },
    include: userWithRelations.include,
  });
};

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: userWithRelations.include,
  });
};

export const createOrganizationWithAdmin = async (data: {
  organization: {
    name: string;
  };
  adminUser: {
    name: string;
    email: string;
    passwordHash: string;
  };
}) => {
  return rootPrisma.$transaction(async (tx) => {
    // 1. Check if email exists
    const existingUser = await tx.user.findFirst({
      where: { email: data.adminUser.email },
    });

    if (existingUser) {
      throw new Error("Email is already in use");
    }

    // 2. Create Organization
    const organization = await tx.organization.create({
      data: {
        name: data.organization.name,
        status: 1,
      },
    });

    // 3. Create Default Branch
    const branch = await tx.branch.create({
      data: {
        organizationId: organization.id,
        name: "Main Branch",
        status: 1,
      },
    });

    // 4. Find the Branch Admin Role
    const branchAdminRole = await tx.role.findFirst({
      where: { key: "branch_admin" },
    });

    if (!branchAdminRole) {
      throw new Error("Default system roles not found. Please run seed first.");
    }

    // 5. Find the Admin Workflow
    const adminWorkflow = await tx.workflow.findFirst({
      where: { key: "admin_workflow" },
    });

    // 6. Create User
    const user = await tx.user.create({
      data: {
        name: data.adminUser.name,
        email: data.adminUser.email,
        password: data.adminUser.passwordHash,
        status: 1,
      },
    });

    // 7. Assign Role Scoped to the Branch
    await tx.userRole.create({
      data: {
        userId: user.id,
        roleId: branchAdminRole.id,
        scopeType: "branch",
        scopeId: branch.id,
      },
    });

    // 8. Assign Admin Workflow Scoped to the Branch (for full access)
    if (adminWorkflow) {
      await tx.userWorkflow.create({
        data: {
          userId: user.id,
          workflowId: adminWorkflow.id,
          scopeType: "branch",
          scopeId: branch.id,
        },
      });
    }

    return {
      organization,
      branch,
      user: await tx.user.findUnique({
        where: { id: user.id },
        include: userWithRelations.include,
      }),
    };
  });
};

export const withRootTransaction = async <T>(
  callback: (tx: DbClient) => Promise<T>,
) => rootPrisma.$transaction((tx) => callback(tx));
