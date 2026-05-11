import { Router } from "express";
import { HsnMappingController } from "./hsnmapping.controller.js";
import { validate } from "@/middlewares/validate.js";
import { createHsnMappingSchema } from "./hsnmapping.validation.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: HSN Mapping
 *   description: Management of HSN and Tax relationships
 */

/**
 * @swagger
 * /hsn-mappings:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all HSN-Tax mappings
 *     tags: [HSN Mapping]
 *     responses:
 *       200:
 *         description: List of mappings
 */
router.get("/", isAuthenticated, HsnMappingController.getAll);

/**
 * @swagger
 * /hsn-mappings/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get mapping by ID
 *     tags: [HSN Mapping]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mapping details
 */
router.get("/:id", isAuthenticated, HsnMappingController.getById);

/**
 * @swagger
 * /hsn-mappings:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new HSN-Tax mapping
 *     tags: [HSN Mapping]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hsnid
 *               - taxid
 *             properties:
 *               hsnid: { type: string }
 *               taxid: { type: string }
 *     responses:
 *       201:
 *         description: Mapping created
 */
router.post(
  "/",
  isAuthenticated,
  validate(createHsnMappingSchema),
  HsnMappingController.create,
);

/**
 * @swagger
 * /hsn-mappings/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update an HSN-Tax mapping
 *     tags: [HSN Mapping]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hsnid
 *               - taxid
 *             properties:
 *               hsnid: { type: string }
 *               taxid: { type: string }
 *     responses:
 *       200:
 *         description: Mapping updated
 */
router.put(
  "/:id",
  isAuthenticated,
  validate(createHsnMappingSchema),
  HsnMappingController.update,
);

/**
 * @swagger
 * /hsn-mappings/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a mapping
 *     tags: [HSN Mapping]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mapping deleted
 */
router.delete("/:id", isAuthenticated, HsnMappingController.delete);

export default router;
