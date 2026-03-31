// v1/modules/auth/auth.repository.ts

import { prisma } from "@/lib/prisma.js";

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });
};

export const findRoleByName = (name: string) => {
  return prisma.role.findUnique({
    where: { name },
  });
};

export const createUser = async (data: {
  email: string;
  passwordHash: string;
  roleId: string;
}) => {
  return prisma.user.create({
    data,
    include: { role: true },
  });
};
