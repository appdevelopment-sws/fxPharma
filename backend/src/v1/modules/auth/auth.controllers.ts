import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service.js";
import { sendToken } from "@/helpers/jwtToken.js";
import type { AuthRequest } from "@/middlewares/isAuthenticated.js";
import { catchAsync } from "../../../utils/catchAsync.js";

export class AuthController {
  static register = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);

    res.status(201).json({
      success: true,
      data: result,
      message: "Organization and management branch created successfully",
    });
  });

  static login = catchAsync(async (req: Request, res: Response) => {
    const user = await AuthService.loginUser(req.body.email, req.body.password);

    sendToken(user, res);

    res.status(200).json({
      success: true,
      data: user,
      message: "User logged in successfully",
    });
  });

  static getUser = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const branchId = req.headers["x-branch-id"] as string | undefined;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID missing from authenticated request",
      });
    }

    const user = await AuthService.getUserById(userId, branchId);

    res.status(200).json({
      success: true,
      data: user,
      message: "User retrieved successfully",
    });
  });

  static logout = catchAsync(async (_req: Request, res: Response) => {
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
  });
}
