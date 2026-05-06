import { Router } from "express";
import { HsnController } from "./hsn.controller.js";
import { validate } from "@/middlewares/validate.js";
import { createHsnSchema, updateHsnSchema } from "./hsn.validation.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: HSN
 *   description: HSN codes and tax mappings management
 */

/**
 * @swagger
 * /hsn:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all HSN codes
 *     tags: [HSN]
 *     responses:
 *       200:
 *         description: List of HSN codes
 */
router.get("/", isAuthenticated, HsnController.getAll);

/**
 * @swagger
 * /hsn/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get HSN code by ID
 *     tags: [HSN]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: HSN code details
 *       404:
 *         description: HSN code not found
 */
router.get("/:id", isAuthenticated, HsnController.getById);

/**
 * @swagger
 * /hsn:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new HSN code
 *     tags: [HSN]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hsncode
 *               - description
 *             properties:
 *               hsncode: { type: string }
 *               description: { type: string }
 *               isActive: { type: boolean }
 *               taxIds: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: HSN code created
 */
router.post(
  "/",
  isAuthenticated,
  validate(createHsnSchema),
  HsnController.create,
);

/**
 * @swagger
 * /hsn/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update an HSN code
 *     tags: [HSN]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hsncode: { type: string }
 *               description: { type: string }
 *               isActive: { type: boolean }
 *               taxIds: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: HSN code updated
 */
router.put(
  "/:id",
  isAuthenticated,
  validate(updateHsnSchema),
  HsnController.update,
);

/**
 * @swagger
 * /hsn/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete an HSN code
 *     tags: [HSN]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: HSN code deleted
 */
router.delete("/:id", isAuthenticated, HsnController.delete);

export default router;
