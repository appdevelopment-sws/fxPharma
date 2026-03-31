// v1/modules/auth/auth.controllers.ts
import { Request, Response } from "express";
import * as authService from "./auth.service.js";

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
    res
      .status(200)
      .json({
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
