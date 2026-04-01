import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import authRoutes from "./v1/modules/auth/auth.routes.js";

dotenv.config();

const app = express();

const allowedOrigins = [process.env.CLIENT_URL || ""].filter(Boolean);
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.set("trust proxy", 1);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  }),
);

const port = process.env.PORT || 5000;

app.use("/api/v1/auth", authLimiter, authRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.json("hello from backend");
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

export default app;
