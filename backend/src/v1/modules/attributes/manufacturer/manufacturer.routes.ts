import { Router } from "express";
import { ManufacturerController } from "./manufacturer.controller.js";
import { validate } from "@/middlewares/validate.js";
import { createManufacturerSchema, updateManufacturerSchema } from "./manufacturer.validation.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Manufacturers
 *   description: Product manufacturer management
 */

/**
 * @swagger
 * /attributes/manufacturers:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all manufacturers
 *     tags: [Manufacturers]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/search'
 *     responses:
 *       200:
 *         description: List of manufacturers
 */
router.get("/", isAuthenticated, ManufacturerController.getAll);

/**
 * @swagger
 * /attributes/manufacturers/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get manufacturer by ID
 *     tags: [Manufacturers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Manufacturer details
 */
router.get("/:id", isAuthenticated, ManufacturerController.getById);

/**
 * @swagger
 * /attributes/manufacturers:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new manufacturer
 *     tags: [Manufacturers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *               isActive: { type: boolean }
 *     responses:
 *       201:
 *         description: Manufacturer created
 */
router.post("/", isAuthenticated, validate(createManufacturerSchema), ManufacturerController.create);

/**
 * @swagger
 * /attributes/manufacturers/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a manufacturer
 *     tags: [Manufacturers]
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
 *     responses:
 *       200:
 *         description: Manufacturer updated
 */
router.put("/:id", isAuthenticated, validate(updateManufacturerSchema), ManufacturerController.update);

/**
 * @swagger
 * /attributes/manufacturers/{id}/status:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Update manufacturer status
 *     tags: [Manufacturers]
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
 *             required: [isActive]
 *             properties:
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch("/:id/status", isAuthenticated, ManufacturerController.updateStatus);

/**
 * @swagger
 * /attributes/manufacturers/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a manufacturer
 *     tags: [Manufacturers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Manufacturer deleted
 */
router.delete("/:id", isAuthenticated, ManufacturerController.delete);

export default router;
