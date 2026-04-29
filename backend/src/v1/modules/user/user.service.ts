import { prisma } from "@/lib/prisma.js";
import bcrypt from "bcryptjs";

export const createUser = async (
  creatorId: string,
  data: {
    name: string;
    email: string;
    password: string;
    roleId: string;
    scopeType: "global" | "branch";
    scopeId?: string;
  }
) => {
  // 1. Get creator's max level
  const creatorRoles = await prisma.userRole.findMany({
    where: { userId: creatorId },
    include: { role: true },
  });

  const creatorMaxLevel = Math.max(...creatorRoles.map((ur) => ur.role.level), 0);

  // 2. Get target role's level
  const targetRole = await prisma.role.findUnique({
    where: { id: data.roleId },
  });

  if (!targetRole) throw new Error("Target role not found");

  // 3. Hierarchy Check: Creator must have higher level than target role
  // (Super Admin Level 100 can create anything, but level 80 can only create < 80)
  if (creatorMaxLevel < 100 && targetRole.level >= creatorMaxLevel) {
    throw new Error("Forbidden: You cannot create a user with a higher or equal role level");
  }

  // 4. Create User
  const hashedPassword = await bcrypt.hash(data.password, 12);
  
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        status: 1,
      },
    });

    await tx.userRole.create({
      data: {
        userId: user.id,
        roleId: data.roleId,
        scopeType: data.scopeType,
        scopeId: data.scopeId,
      },
    });

    return user;
  });
};

export const listUsersByScope = async (scopeType: "global" | "branch", scopeId?: string) => {
  return prisma.user.findMany({
    where: {
      roles: {
        some: {
          scopeType,
          scopeId: scopeId || null,
        },
      },
    },
    include: {
      roles: {
        include: { role: true, branch: true },
      },
    },
  });
};
