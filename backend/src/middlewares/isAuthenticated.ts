// middleware/auth.middleware.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    tenantId: string;
    permissions?: string[];
  };
  tenantId?: string; // ✅ ADD THIS
}

export const isAuthenticated = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    req.user = decoded as any;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
