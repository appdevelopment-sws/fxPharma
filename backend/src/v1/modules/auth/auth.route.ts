import { Router } from "express";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";
import { AuthController } from "./auth.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

router.get("/getuser", isAuthenticated, AuthController.getUser);
router.post("/logout", AuthController.logout);

export default router;
