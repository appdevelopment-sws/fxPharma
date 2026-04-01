import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    tenantId: string;
    email: string;
    permissions?: string[];
  };
  tenantId?: string;
}

const accessTokenSecret = process.env.JWT_SECRET;

if (!accessTokenSecret) {
  throw new Error("JWT_SECRET is not configured");
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

    const decoded = jwt.verify(token, accessTokenSecret) as AuthRequest["user"];

    if (!decoded?.id || !decoded.tenantId || !decoded.role) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = decoded;
    req.tenantId = decoded.tenantId;

    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
