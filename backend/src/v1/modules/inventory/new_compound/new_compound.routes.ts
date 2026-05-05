import { Router } from "express";
import { NewCompoundController } from "./new_compound.controller.js";
import { validate } from "@/middlewares/validate.js";
import {
  createCompoundSchema,
  updateCompoundSchema,
} from "./new_compound.validation.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";
import { attachTenant } from "@/middlewares/tenant.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: NewCompounds
 *   description: New Compound management
 */

/**
 * @swagger
 * /inventory/new_compound:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all new compounds
 *     tags: [NewCompounds]
 *     responses:
 *       200:
 *         description: List of compounds
 */
router.get("/", isAuthenticated, attachTenant, NewCompoundController.getAll);

/**
 * @swagger
 * /inventory/new_compound/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get compound by ID
 *     tags: [NewCompounds]
 *     responses:
 *       200:
 *         description: Compound details
 */
router.get("/:id", isAuthenticated, NewCompoundController.getById);

/**
 * @swagger
 * /inventory/new_compound:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new compound
 *     tags: [NewCompounds]
 *     responses:
 *       201:
 *         description: Compound created
 */
router.post(
  "/",
  isAuthenticated,
  validate(createCompoundSchema),
  NewCompoundController.create,
);

/**
 * @swagger
 * /inventory/new_compound/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a compound
 *     tags: [NewCompounds]
 *     responses:
 *       200:
 *         description: Compound updated
 */
router.put(
  "/:id",
  isAuthenticated,
  validate(updateCompoundSchema),
  NewCompoundController.update,
);

/**
 * @swagger
 * /inventory/new_compound/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a compound
 *     tags: [NewCompounds]
 *     responses:
 *       200:
 *         description: Compound deleted
 */
router.delete("/:id", isAuthenticated, NewCompoundController.delete);

export default router;
