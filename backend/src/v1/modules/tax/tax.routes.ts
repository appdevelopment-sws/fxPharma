import { Router } from "express";
import { TaxController } from "./tax.controller.js";
import { validate } from "@/middlewares/validate.js";
import { createTaxSchema, updateTaxSchema } from "./tax.validation.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Taxes
 *   description: Tax rules management
 */

/**
 * @swagger
 * /taxes:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all tax rules
 *     tags: [Taxes]
 *     responses:
 *       200:
 *         description: List of tax rules
 */
router.get("/", isAuthenticated, TaxController.getAll);

/**
 * @swagger
 * /taxes/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get tax rule by ID
 *     tags: [Taxes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tax rule details
 *       404:
 *         description: Tax rule not found
 */
router.get("/:id", isAuthenticated, TaxController.getById);

/**
 * @swagger
 * /taxes:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new tax rule
 *     tags: [Taxes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - rate
 *               - taxType
 *             properties:
 *               name: { type: string }
 *               rate: { type: number }
 *               taxType: { type: string, enum: [Exclusive, Inclusive] }
 *               isActive: { type: boolean }
 *     responses:
 *       201:
 *         description: Tax rule created
 */
router.post(
  "/",
  isAuthenticated,
  validate(createTaxSchema),
  TaxController.create,
);

/**
 * @swagger
 * /taxes/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a tax rule
 *     tags: [Taxes]
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
 *               name: { type: string }
 *               rate: { type: number }
 *               taxType: { type: string, enum: [Exclusive, Inclusive] }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Tax rule updated
 */
router.put(
  "/:id",
  validate(updateTaxSchema),
  isAuthenticated,
  TaxController.update,
);

/**
 * @swagger
 * /taxes/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a tax rule
 *     tags: [Taxes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tax rule deleted
 */
router.delete("/:id", isAuthenticated, TaxController.delete);

export default router;
