import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, Router } from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import swaggerUi from "swagger-ui-express";

import uploadRoutes from "./v1/modules/upload/upload.routes.js";
import path from "path";

import { authLimiter, generalLimiter } from "./helpers/rateLimit.js";
import { swaggerSpec } from "./config/swagger.config.js";
import { isAuthenticated } from "./middlewares/isAuthenticated.js";
import { globalErrorHandler } from "./middlewares/errorHandler.js";
import authRoutes from "./v1/modules/auth/auth.route.js";
import featuresRoutes from "./v1/modules/features/features.routes.js";
import plansRoutes from "./v1/modules/plans/plans.route.js";

const app = express();

const allowedOrigins = [process.env.CLIENT_URL || ""].filter(Boolean);

app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
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

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const port = process.env.PORT || 5000;

// 1. Public Routes

// 2. Protected & Tenant Scoped Routes
const router = Router();

router.use("/upload", generalLimiter, uploadRoutes);

app.use("/api/v1", router);

app.use("/uploads", express.static(path.join(process.cwd(), "src/uploads")));
app.use("/api/v1/auth", authLimiter, authRoutes);

app.use("/api/v1/features", generalLimiter, featuresRoutes);
app.use("/api/v1/plans", generalLimiter, plansRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.json("hello from backend");
});

// Global Error Handler (Must be last)
app.use(globalErrorHandler as any);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

export default app;
