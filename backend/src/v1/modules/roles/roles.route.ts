import { Router } from "express";
import { validate } from "@/middlewares/validate.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";
import { RolesController } from "./roles.controller.js";
import { createRoleSchema, updateRoleSchema } from "./role.validation.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management (create, update, delete, list)
 */

router.get("/", isAuthenticated, RolesController.getAll);
router.get("/:id", isAuthenticated, RolesController.getById);

router.post(
  "/",
  isAuthenticated,
  validate(createRoleSchema),
  RolesController.create,
);
router.put(
  "/:id",
  isAuthenticated,
  validate(updateRoleSchema),
  RolesController.update,
);
router.delete("/:id", isAuthenticated, RolesController.delete);

export default router;
