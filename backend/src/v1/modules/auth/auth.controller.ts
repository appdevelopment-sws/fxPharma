import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { rootPrisma } from "@/lib/prisma.js";
import { AuthRequest } from "@/middlewares/isAuthenticated.js";
import { sendToken } from "@/helpers/jwtToken.js";

const JWT_SECRET = process.env.JWT_SECRET!;

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name, phone } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: "Email, password, and name are required",
        });
      }

      // Check if user already exists
      const existingUser = await rootPrisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await rootPrisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          phone,
        },
      });

      // Remove passwordHash from response
      const { passwordHash: _, ...userWithoutPassword } = user;

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

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
      const user = await rootPrisma.user.findUnique({
        where: { email },
        include: {
          organizations: {
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

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

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

      // Remove passwordHash from response
      const { passwordHash: _, ...userWithoutPassword } = user;
      sendToken(user, res);
      return res.json({
        success: true,
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  //////////////////////////////////////////////////////
  // GET CURRENT USER
  //////////////////////////////////////////////////////

  static async getUser(req: AuthRequest, res: Response) {
    try {
      const authUser = req.user;

      if (!authUser) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const user = await rootPrisma.user.findUnique({
        where: {
          id: authUser.id,
        },
        include: {
          organizations: {
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

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Remove passwordHash from response
      const { passwordHash: _, ...userWithoutPassword } = user;

      return res.json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
