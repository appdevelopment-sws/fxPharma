import { Router } from "express";
import { SuperAdminController } from "./superadmin.controller.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";

const router = Router();

router.get("/dashboard-stats", isAuthenticated, SuperAdminController.getDashboardStats);
router.get("/audit-logs", isAuthenticated, SuperAdminController.getAuditLogs);

export default router;
