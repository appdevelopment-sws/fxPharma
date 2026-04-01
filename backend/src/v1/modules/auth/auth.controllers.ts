// v1/modules/auth/auth.controllers.ts
import { Request, Response } from "express";
import * as authService from "./auth.service.js";
import { sendToken } from "@/helpers/jwtToken.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await authService.register({ email, password });
    res.status(201).json({
      success: true,
      data: user,
      message: "User registered successfully",
    });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser(email, password);
    await sendToken(user, 200, res);

    res.status(200).json({
      success: true,
      data: user,
      message: "User loggedin successfully",
    });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getUser = async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID missing" });
    }

    const user = await authService.getUserById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: "User retrieved successfully",
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
