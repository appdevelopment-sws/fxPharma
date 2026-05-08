import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { rootPrisma } from "@/lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET!;

export class AuthController {
  //////////////////////////////////////////////////////
  // LOGIN
  //////////////////////////////////////////////////////

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password required",
        });
      }

      // Find user
      const user = await rootPrisma.user.findFirst({
        where: {
          email,
        },
        include: {
          memberships: {
            include: {
              organization: true,
              branch: true,
              role: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Create token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },
        JWT_SECRET,
        {
          expiresIn: "7d",
        },
      );

      return res.json({
        success: true,
        token,
        user,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  //////////////////////////////////////////////////////
  // GET CURRENT USER
  //////////////////////////////////////////////////////

  static async getUser(req: Request, res: Response) {
    try {
      const authUser = req.user;

      const user = await rootPrisma.user.findUnique({
        where: {
          id: authUser.id,
        },
        include: {
          memberships: {
            include: {
              organization: true,
              branch: true,
              role: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.json({
        success: true,
        user,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
