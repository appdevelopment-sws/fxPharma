// v1/modules/auth/auth.routes.ts
import { Router } from "express";
import * as authController from "./auth.controllers.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;
