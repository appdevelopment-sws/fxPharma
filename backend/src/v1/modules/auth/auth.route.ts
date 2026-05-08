import { Router } from "express";
import multer from "multer";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";
import { AuthController } from "./auth.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload management
 */

router.post("/login", AuthController.login);

router.get("/me", isAuthenticated, AuthController.getUser);

export default router;
