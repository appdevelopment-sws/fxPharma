// v1/modules/auth/auth.service.ts
import { prisma } from "@/lib/prisma.js";
import * as authRepository from "./auth.repository.js";
import bcrypt from "bcryptjs";
const DEFAULT_ROLE = "User";

export const register = async (data: { email: string; password: string }) => {
  // 🔒 check existing user
  const existingUser = await authRepository.findUserByEmail(data.email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  // 🔑 hash password
  const passwordHash = await bcrypt.hash(data.password, 10);

  // 🎯 get default role
  const userRole = await authRepository.findRoleByName(DEFAULT_ROLE);
  if (!userRole) {
    throw new Error("Default role not found");
  }

  // 👤 create user
  const user = await authRepository.createUser({
    email: data.email,
    passwordHash,
    roleId: userRole.id,
  });
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) throw new Error("No user Found");
  console.log("User found:", user);
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("Invalid credentials");

  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
};
