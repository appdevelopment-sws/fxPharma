import { rootPrisma } from "@/lib/prisma.js";
import { Prisma } from "@prisma/client";

export class StoreListRepository {
  static async findAll(where: Prisma.OrganizationWhereInput = {}, skip?: number, take?: number) {
    const [data, total] = await Promise.all([
      rootPrisma.organization.findMany({
        where,
        skip,
        take,
        include: {
          owner: true,
          plan: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      rootPrisma.organization.count({ where }),
    ]);

    return { data, total };
  }

  static async findById(id: string) {
    return rootPrisma.organization.findUnique({
      where: { id },
      include: {
        owner: true,
        plan: true,
      },
    });
  }

  static async createStoreWithUser(data: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
      passwordHash: string;
      mobile: string;
    };
    organization: any;
  }) {
    return rootPrisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          name: `${data.user.firstName} ${data.user.lastName}`,
          email: data.user.email,
          password: data.user.passwordHash,
          mobile: data.user.mobile,
          status: 1,
        },
      });

      // 2. Create Organization
      const organization = await tx.organization.create({
        data: {
          ...data.organization,
          ownerId: user.id,
        },
      });

      // 3. Create Main Branch
      const branch = await tx.branch.create({
        data: {
          organizationId: organization.id,
          name: "Main Branch",
          status: 1,
        },
      });

      // 4. Assign Roles (Branch Admin)
      const branchAdminRole = await tx.role.findFirst({
        where: { key: "branch_admin" },
      });

      if (branchAdminRole) {
        await tx.userRole.create({
          data: {
            userId: user.id,
            roleId: branchAdminRole.id,
            scopeType: "organization",
            scopeId: organization.id,
          },
        });
      }

      // 5. Assign Workflows (Admin Workflow)
      const adminWorkflow = await tx.workflow.findFirst({
        where: { key: "admin_workflow" },
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

      return organization;
    });
  }

  static async updateStore(id: string, data: any) {
    return rootPrisma.$transaction(async (tx) => {
      const store = await tx.organization.findUnique({ where: { id } });
      if (!store) throw new Error("Store not found");

      // Update Organization
      const updatedOrganization = await tx.organization.update({
        where: { id },
        data: {
          storeName: data.storeName,
          description: data.description,
          category: data.category,
          logo: data.logo,
          status: data.status,
          gstNo: data.gstNo,
          licenseNo: data.licenseNo,
          streetAddress: data.streetAddress,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          timezone: data.timezone,
          currency: data.currency,
          planId: data.planId,
        },
      });

      // Update User (Owner)
      if (store.ownerId && (data.ownerFirstName || data.ownerLastName || data.ownerPhone || data.loginEmail)) {
        await tx.user.update({
          where: { id: store.ownerId },
          data: {
            firstName: data.ownerFirstName,
            lastName: data.ownerLastName,
            name: (data.ownerFirstName || data.ownerLastName)
              ? `${data.ownerFirstName || ""} ${data.ownerLastName || ""}`.trim()
              : undefined,
            mobile: data.ownerPhone,
            email: data.loginEmail,
          },
        });
      }

      return updatedOrganization;
    });
  }

  static async delete(id: string) {
    return rootPrisma.organization.delete({
      where: { id },
    });
  }
}
