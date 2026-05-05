import { Router } from "express";
import { BrandsController } from "./brands.controller.js";
import { validate } from "@/middlewares/validate.js";
import { createBrandSchema, updateBrandSchema } from "./brands.validation.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Brands
 *   description: Product brand management
 */

/**
 * @swagger
 * /attributes/brands:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all brands
 *     tags: [Brands]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/search'
 *     responses:
 *       200:
 *         description: List of brands
 */
router.get("/", isAuthenticated, BrandsController.getAll);

/**
 * @swagger
 * /attributes/brands/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get brand by ID
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand details
 */
router.get("/:id", isAuthenticated, BrandsController.getById);

/**
 * @swagger
 * /attributes/brands:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new brand
 *     tags: [Brands]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               logo: { type: string }
 *               status: { type: string, enum: [ACTIVE, INACTIVE] }
 *     responses:
 *       201:
 *         description: Brand created
 */
router.post("/", isAuthenticated, validate(createBrandSchema), BrandsController.create);

/**
 * @swagger
 * /attributes/brands/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a brand
 *     tags: [Brands]
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
 *         description: Brand updated
 */
router.put("/:id", isAuthenticated, validate(updateBrandSchema), BrandsController.update);

/**
 * @swagger
 * /attributes/brands/{id}/status:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Update brand status
 *     tags: [Brands]
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
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [ACTIVE, INACTIVE] }
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch("/:id/status", isAuthenticated, BrandsController.updateStatus);

/**
 * @swagger
 * /attributes/brands/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a brand
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand deleted
 */
router.delete("/:id", isAuthenticated, BrandsController.delete);

export default router;
