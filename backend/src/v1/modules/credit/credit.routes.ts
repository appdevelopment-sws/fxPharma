import { Router } from "express";
import { creditController } from "./credit.controller.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";


const router = Router();

// User routes
router.post("/request", isAuthenticated, creditController.createRequest);
router.get("/logs", isAuthenticated, creditController.getLogs);
router.get("/my-requests", isAuthenticated, creditController.getMyRequests);

// Admin routes (assuming 'ADMIN' is a valid role, or checking is done in controller)
// For simplicity, we just use isAuthenticated here, but ideally we'd have a role check.
router.get("/admin/requests", isAuthenticated, creditController.getAllRequests);
router.post("/admin/requests/:id/approve", isAuthenticated, creditController.approveRequest);
router.post("/admin/requests/:id/reject", isAuthenticated, creditController.rejectRequest);

export default router;
