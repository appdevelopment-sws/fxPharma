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

export class AuthRepository {
  static userWithRelations = {
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

  static async findUserForLogin(email: string) {
    return rootPrisma.user.findFirst({
      where: {
        email,
      },
      include: this.userWithRelations.include,
    });
  }

  static async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: this.userWithRelations.include,
    });
  }

  static async createOrganizationWithAdmin(data: {
    organization: {
      name: string;
    };
    adminUser: {
      name: string;
      email: string;
      passwordHash: string;
    };
  }) {
    return rootPrisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: { email: data.adminUser.email },
      });

      if (existingUser) {
        throw new Error("Email is already in use");
      }

      const organization = await tx.organization.create({
        data: {
          name: data.organization.name,
          status: 1,
        },
      });

      const branch = await tx.branch.create({
        data: {
          organizationId: organization.id,
          name: "Main Branch",
          status: 1,
        },
      });

      const branchAdminRole = await tx.role.findFirst({
        where: { key: "branch_admin" },
      });

      if (!branchAdminRole) {
        throw new Error(
          "Default system roles not found. Please run seed first.",
        );
      }

      const adminWorkflow = await tx.workflow.findFirst({
        where: { key: "admin_workflow" },
      });

      const user = await tx.user.create({
        data: {
          name: data.adminUser.name,
          email: data.adminUser.email,
          password: data.adminUser.passwordHash,
          status: 1,
        },
      });

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: branchAdminRole.id,
          scopeType: "organization",
          scopeId: organization.id,
        },
      });

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
          include: this.userWithRelations.include,
        }),
      };
    });
  }

  static async withRootTransaction<T>(callback: (tx: DbClient) => Promise<T>) {
    return rootPrisma.$transaction((tx) => callback(tx));
  }
}
