import { Router } from "express";
import * as authController from "./auth.controllers.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";
import { attachTenant } from "@/middlewares/tenant.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/getuser", isAuthenticated, attachTenant, authController.getUser);

export default router;
