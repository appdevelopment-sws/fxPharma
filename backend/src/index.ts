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
import { globalErrorHandler } from "./middlewares/errorHandler.js";
import authRoutes from "./v1/modules/auth/auth.route.js";
import featuresRoutes from "./v1/modules/features/features.routes.js";
import plansRoutes from "./v1/modules/plans/plans.route.js";
import taxRoutes from "./v1/modules/tax/tax.routes.js";
import hsnRoutes from "./v1/modules/hsn/hsn.routes.js";
import hsnMappingRoutes from "./v1/modules/hsnmapping/hsnmapping.routes.js";
import manufacturerRoutes from "./v1/modules/attributes/manufacturer/manufacturer.routes.js";
import categoryRoutes from "./v1/modules/attributes/categories/categories.routes.js";
import brandRoutes from "./v1/modules/attributes/brands/brands.routes.js";
import unitRoutes from "./v1/modules/attributes/units/units.routes.js";
import masterProductRoutes from "./v1/modules/masterProducts/masterProduct.routes.js";
import StoreListRoutes from "./v1/modules/storelist/storelist.routes.js";
import rolesRoutes from "./v1/modules/roles/roles.route.js";
import branchesRoutes from "./v1/modules/branches/branches.route.js";
import usersRoutes from "./v1/modules/users/users.route.js";

import SupplierRoutes from "./v1/modules/suppliers/suppliers.routes.js";
import OrdersRoutes from "./v1/modules/orders/orders.routes.js";
import MedicineRoutes from "./v1/modules/inventory/add_medicine/add_medicine.routes.js";
import CompoundRoutes from "./v1/modules/inventory/new_compound/new_compound.routes.js";

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
app.use("/api/v1/taxes", generalLimiter, taxRoutes);
app.use("/api/v1/hsn", generalLimiter, hsnRoutes);
app.use("/api/v1/hsn-mappings", generalLimiter, hsnMappingRoutes);

app.use("/api/v1/attributes/brands", generalLimiter, brandRoutes);
app.use("/api/v1/attributes/categories", generalLimiter, categoryRoutes);
app.use("/api/v1/attributes/manufacturers", generalLimiter, manufacturerRoutes);
app.use("/api/v1/attributes/units", generalLimiter, unitRoutes);

app.use("/api/v1/master-products", generalLimiter, masterProductRoutes);
app.use("/api/v1/storelist", generalLimiter, StoreListRoutes);
app.use("/api/v1/branches", generalLimiter, branchesRoutes);
app.use("/api/v1/users", generalLimiter, usersRoutes);
app.use("/api/v1/suppliers", generalLimiter, SupplierRoutes);
app.use("/api/v1/roles", generalLimiter, rolesRoutes);
app.use("/api/v1/orders", generalLimiter, OrdersRoutes);
app.use("/api/v1/inventory/add-medicine", generalLimiter, MedicineRoutes);
app.use("/api/v1/compound", generalLimiter, categoryRoutes);
app.get("/", (_req: Request, res: Response) => {
  res.json("hello from backend");
});

// Global Error Handler (Must be last)
app.use(globalErrorHandler as any);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

export default app;
