import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import { rootPrisma } from "@/lib/prisma.js";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";
import { buildSearchFilter } from "@/utils/buildSearchFilter.js";
import { getRequestScope } from "@/helpers/requestScope.js";

const normalizeUser = (user: any) => ({
  ...user,
  passwordHash: undefined,
  organizations: user.organizations?.map((membership: any) => ({
    ...membership,
    branchIds: membership.branches?.map((link: any) => link.branchId) ?? [],
  })),
});

const findRoleScope = async (roleId: string) => {
  const role = await rootPrisma.role.findUnique({
    where: { id: roleId },
    select: { id: true, scope: true },
  });

  return role?.scope ?? null;
};

export class UsersController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, async (skip, take, search) => {
      const { organizationId, branchId } = getRequestScope(req);
      const where: any = {
        organizations: {
          some: {
            organizationId,
          },
        },
        ...buildSearchFilter(search, ["name", "email", "phone"]),
      };

      const [data, total] = await Promise.all([
        rootPrisma.user.findMany({
          where,
          include: {
            organizations: {
              where: { organizationId },
              include: {
                organization: true,
                role: true,
                branches: {
                  include: {
                    branch: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          ...(skip !== undefined && { skip }),
          ...(take !== undefined && { take }),
        }),
        rootPrisma.user.count({ where }),
      ]);

      return {
        data: data.map(normalizeUser),
        total,
      };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const user = await rootPrisma.user.findFirst({
      where: {
        id: req.params.id as string,
        organizations: {
          some: {
            organizationId,
            ...(branchId
              ? {
                  branches: {
                    some: {
                      branchId,
                    },
                  },
                }
              : {}),
          },
        },
      },
      include: {
        organizations: {
          where: {
            organizationId,
            ...(branchId
              ? {
                  branches: {
                    some: {
                      branchId,
                    },
                  },
                }
              : {}),
          },
          include: {
            organization: true,
            role: true,
            branches: {
              ...(branchId
                ? {
                    where: {
                      branchId,
                    },
                  }
                : {}),
              include: {
                branch: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: normalizeUser(user) });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const { organizationId } = getRequestScope(req);
    const { name, email, password, phone, roleId, branchId } = req.body;

    const existingUser = await rootPrisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const roleScope = await findRoleScope(roleId);
    const shouldAssignBranch = roleScope === "BRANCH";

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await rootPrisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name,
          email,
          phone,
          passwordHash,
        },
      });

      const membership = await tx.organizationMember.create({
        data: {
          userId: createdUser.id,
          organizationId,
          roleId,
          status: "ACTIVE",
        },
      });

      if (branchId) {
        await tx.memberBranch.create({
          data: {
            memberId: membership.id,
            branchId,
          },
        });
      }

      return tx.user.findUnique({
        where: { id: createdUser.id },
        include: {
          organizations: {
            where: { organizationId },
            include: {
              organization: true,
              role: true,
              branches: {
                include: {
                  branch: true,
                },
              },
            },
          },
        },
      });
    });

    if (!user) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to create user" });
    }

    res.status(201).json({ success: true, data: normalizeUser(user) });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const { organizationId } = getRequestScope(req);
    const userId = req.params.id as string;
    const { name, email, password, phone, roleId, branchId, status } = req.body;

    const membership = await rootPrisma.organizationMember.findFirst({
      where: {
        userId,
        organizationId,
      },
      select: { id: true, roleId: true },
    });

    if (!membership) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const roleScope = roleId ? await findRoleScope(roleId) : null;
    const shouldAssignBranch = roleScope === "BRANCH";

    const updated = await rootPrisma.$transaction(async (tx) => {
      const data: any = {};
      if (name !== undefined) data.name = name;
      if (email !== undefined) data.email = email;
      if (phone !== undefined) data.phone = phone;
      if (password) data.passwordHash = await bcrypt.hash(password, 10);
      if (status) data.status = status;

      await tx.user.update({
        where: { id: userId },
        data,
      });

      const membershipData: any = {};
      if (roleId) membershipData.roleId = roleId;
      if (status) membershipData.status = status;

      if (Object.keys(membershipData).length > 0) {
        await tx.organizationMember.update({
          where: { id: membership.id },
          data: membershipData,
        });
      }

      await tx.memberBranch.deleteMany({
        where: { memberId: membership.id },
      });

      if (shouldAssignBranch && branchId) {
        await tx.memberBranch.create({
          data: {
            memberId: membership.id,
            branchId,
          },
        });
      }

      return tx.user.findUnique({
        where: { id: userId },
        include: {
          organizations: {
            where: { organizationId },
            include: {
              organization: true,
              role: true,
              branches: {
                include: {
                  branch: true,
                },
              },
            },
          },
        },
      });
    });

    if (!updated) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to update user" });
    }

    res.json({ success: true, data: normalizeUser(updated) });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    const { organizationId } = getRequestScope(req);
    const user = await rootPrisma.user.findFirst({
      where: {
        id: req.params.id as string,
        organizations: {
          some: {
            organizationId,
          },
        },
      },
      select: { id: true },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await rootPrisma.user.delete({ where: { id: user.id } });

    res.json({ success: true, message: "User deleted successfully" });
  });
}
