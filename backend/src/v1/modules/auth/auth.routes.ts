import { Router } from "express";
import * as authController from "./auth.controllers.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/getuser", isAuthenticated, authController.getUser);

export default router;
