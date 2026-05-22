import { Router } from "express";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";
import { validate } from "@/middlewares/validate.js";
import { ReturnsController } from "./returns.controller.js";
import {
  createReturnSchema,
  updateReturnStatusSchema,
} from "./returns.validation.js";

const router = Router();

router.get("/", isAuthenticated, ReturnsController.getAll);
router.get("/stats", isAuthenticated, ReturnsController.getStats);
router.get("/:id", isAuthenticated, ReturnsController.getById);
router.post(
  "/",
  isAuthenticated,
  validate(createReturnSchema),
  ReturnsController.create,
);
router.patch(
  "/:id/status",
  isAuthenticated,
  validate(updateReturnStatusSchema),
  ReturnsController.updateStatus,
);

export default router;
