import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service.js";
import { loginSchema, registerSchema } from "./auth.validation.js";
import { sendToken } from "@/helpers/jwtToken.js";
import type { AuthRequest } from "@/middlewares/isAuthenticated.js";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = registerSchema.parse(req.body);
    const result = await authService.register(payload);

    res.status(201).json({
      success: true,
      data: result,
      message: "Organization and management branch created successfully",
    });
  } catch (error: any) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = loginSchema.parse(req.body);
    const user = await authService.loginUser(payload.email, payload.password);

    sendToken(user, res);

    res.status(200).json({
      success: true,
      data: user,
      message: "User logged in successfully",
    });
  } catch (error: any) {
    next(error);
  }
};

export const getUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const branchId = req.headers["x-branch-id"] as string | undefined;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID missing from authenticated request",
      });
    }

    const user = await authService.getUserById(userId, branchId);

    res.status(200).json({
      success: true,
      data: user,
      message: "User retrieved successfully",
    });
  } catch (error: any) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
