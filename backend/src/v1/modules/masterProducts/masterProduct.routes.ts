import { Router } from "express";
import { MasterProductController } from "./masterProduct.controller.js";
import { validate } from "@/middlewares/validate.js";
import {
  createMasterProductSchema,
  updateMasterProductSchema,
} from "./masterProduct.validation.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: MasterProducts
 *   description: Master products management
 */

router.get("/", isAuthenticated, MasterProductController.getAll);
router.get("/:id", isAuthenticated, MasterProductController.getById);
router.post(
  "/",
  isAuthenticated,
  validate(createMasterProductSchema),
  MasterProductController.create,
);
router.put(
  "/:id",
  isAuthenticated,
  validate(updateMasterProductSchema),
  MasterProductController.update,
);
router.delete("/:id", isAuthenticated, MasterProductController.delete);

export default router;
