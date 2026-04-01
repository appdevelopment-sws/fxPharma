import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

export const sendToken = async (user: any, statusCode: number, res: any) => {
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

  res.status(statusCode).json({
    success: true,
    user,
  });
};

export const generateAccessToken = (user: any) => {
  console.log(
    "Generating access token for user:",
    user,
    process.env.JWT_SECRET,
  );
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "12h" },
  );
};

export const generateRefreshToken = (user: any) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "7d" },
  );
};
