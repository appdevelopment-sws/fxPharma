import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, Router } from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import swaggerUi from "swagger-ui-express";

import authRoutes from "./v1/modules/auth/auth.routes.js";
import demoRoutes from "./v1/modules/demo/demo.routes.js";

import { authLimiter, generalLimiter } from "./helpers/rateLimit.js";
import { swaggerSpec } from "./config/swagger.config.js";
import { tenantMiddleware } from "./middlewares/tenantMiddleware.js";
import { isAuthenticated } from "./middlewares/isAuthenticated.js";
import { globalErrorHandler } from "./middlewares/errorHandler.js";

const app = express();

const allowedOrigins = [process.env.CLIENT_URL || ""].filter(Boolean);

app.set("trust proxy", 1);
app.use(helmet({
  contentSecurityPolicy: false,
}));
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

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const port = process.env.PORT || 5000;

// 1. Public Routes
app.use("/api/v1/auth", authLimiter, authRoutes);

// 2. Protected & Tenant Scoped Routes
const protectedRouter = Router();
protectedRouter.use(isAuthenticated as any);
protectedRouter.use(tenantMiddleware as any);

//protectedRouter.use("/master-products", generalLimiter, masterProductRoutes);
//protectedRouter.use("/organizations", generalLimiter, organizationRoutes);
protectedRouter.use("/demo", generalLimiter, demoRoutes);

app.use("/api/v1", protectedRouter);

app.get("/", (_req: Request, res: Response) => {
  res.json("hello from backend");
});

// Global Error Handler (Must be last)
app.use(globalErrorHandler as any);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

export default app;
