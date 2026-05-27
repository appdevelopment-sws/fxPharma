import { Router } from "express";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";
import { SettingsController } from "./settings.controller.js";

const router = Router();

router.get("/", isAuthenticated, SettingsController.getSettings);
router.get("/:key", isAuthenticated, SettingsController.getSettingByKey);
router.put("/", isAuthenticated, SettingsController.saveSettings);

export default router;
