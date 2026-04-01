import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

type AuthTokenUser = {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
};

const accessTokenSecret = process.env.JWT_SECRET;
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;

if (!accessTokenSecret || !refreshTokenSecret) {
  throw new Error("JWT secrets are not configured");
}

export const sendToken = (user: AuthTokenUser, res: any) => {
  const refreshToken = generateRefreshToken(user);
  const accessToken = generateAccessToken(user);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 12 * 60 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const generateAccessToken = (user: AuthTokenUser) =>
  jwt.sign(
    {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    },
    accessTokenSecret,
    { expiresIn: "12h" },
  );

export const generateRefreshToken = (user: AuthTokenUser) =>
  jwt.sign(
    {
      id: user.id,
      tenantId: user.tenantId,
    },
    refreshTokenSecret,
    { expiresIn: "7d" },
  );
