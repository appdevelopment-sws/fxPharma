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
import masterProductRoutes from "./v1/modules/masterProducts/masterProduct.routes.js";
// import organizationRoutes from "./v1/modules/organization/organization.routes.js";

import planRoutes from "./v1/modules/plans/plans.routes.js";
import featureRoutes from "./v1/modules/features/features.routes.js";
import demoRoutes from "./v1/modules/demo/demo.routes.js";
import taxRoutes from "./v1/modules/tax/tax.routes.js";
import hsnRoutes from "./v1/modules/hsn/hsn.routes.js";
import hsnMappingRoutes from "./v1/modules/hsnmapping/hsnmapping.routes.js";
import brandRoutes from "./v1/modules/attributes/brands/brands.routes.js";
import categoryRoutes from "./v1/modules/attributes/categories/categories.routes.js";
import manufacturerRoutes from "./v1/modules/attributes/manufacturer/manufacturer.routes.js";
import unitRoutes from "./v1/modules/attributes/units/units.routes.js";
import storelistRoutes from "./v1/modules/storelist/storelist.routes.js";
import supplierRoutes from "./v1/modules/suppliers/suppliers.routes.js";
import inventoryRoutes from "./v1/modules/inventory/add_medicine/add_medicine.routes.js";
import newCompoundRoutes from "./v1/modules/inventory/new_compound/new_compound.routes.js";
import uploadRoutes from "./v1/modules/upload/upload.routes.js";
import path from "path";

import { authLimiter, generalLimiter } from "./helpers/rateLimit.js";
import { swaggerSpec } from "./config/swagger.config.js";
import { tenantMiddleware } from "./middlewares/tenantMiddleware.js";
import { isAuthenticated } from "./middlewares/isAuthenticated.js";
import { globalErrorHandler } from "./middlewares/errorHandler.js";

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

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const port = process.env.PORT || 5000;

// 1. Public Routes
app.use("/api/v1/auth", authLimiter, authRoutes);

// 2. Protected & Tenant Scoped Routes
const protectedRouter = Router();
protectedRouter.use(isAuthenticated as any);
protectedRouter.use(tenantMiddleware as any);

protectedRouter.use("/master-products", generalLimiter, masterProductRoutes);
// protectedRouter.use("/organizations", generalLimiter, organizationRoutes);
protectedRouter.use("/demo", generalLimiter, demoRoutes);
protectedRouter.use("/plans", generalLimiter, planRoutes);
protectedRouter.use("/features", generalLimiter, featureRoutes);
protectedRouter.use("/taxes", generalLimiter, taxRoutes);
protectedRouter.use("/hsn", generalLimiter, hsnRoutes);
protectedRouter.use("/hsn-mappings", generalLimiter, hsnMappingRoutes);
protectedRouter.use("/attributes/brands", generalLimiter, brandRoutes);
protectedRouter.use("/attributes/categories", generalLimiter, categoryRoutes);
protectedRouter.use(
  "/attributes/manufacturers",
  generalLimiter,
  manufacturerRoutes,
);
protectedRouter.use("/attributes/units", generalLimiter, unitRoutes);
protectedRouter.use("/storelist", generalLimiter, storelistRoutes);
protectedRouter.use("/suppliers", generalLimiter, supplierRoutes);
protectedRouter.use("/inventory/add-medicine", generalLimiter, inventoryRoutes);
protectedRouter.use("/inventory/new-compound", generalLimiter, newCompoundRoutes);
protectedRouter.use("/upload", generalLimiter, uploadRoutes);

app.use("/api/v1", protectedRouter);
app.use("/uploads", express.static(path.join(process.cwd(), "src/uploads")));

app.get("/", (_req: Request, res: Response) => {
  res.json("hello from backend");
});

// Global Error Handler (Must be last)
app.use(globalErrorHandler as any);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

export default app;
