// v1/modules/auth/auth.service.ts
import * as authRepository from "./auth.repository.js";
import bcrypt from "bcryptjs";

export const registerUser = async (
  email: string,
  password: string,
  roleId: string,
) => {
  const existingUser = await authRepository.findUserByEmail(email);
  if (existingUser) throw new Error("Email already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  return authRepository.createUser({ email, passwordHash, roleId });
};

export const loginUser = async (email: string, password: string) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("Invalid credentials");

  return user; // Here you can generate a JWT token if needed
};
