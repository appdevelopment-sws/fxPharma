import { Router } from "express";
import { FeaturesController } from "./features.controller.js";
import { validate } from "@/middlewares/validate.js";
import {
  createFeatureSchema,
  updateFeatureSchema,
} from "./features.validation.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Features
 *   description: System features and modules management
 */

/**
 * @swagger
 * /features:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all system features
 *     tags:
 *       - Features
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/search'
 *     responses:
 *       200:
 *         description: List of features
 */
router.get("/", isAuthenticated, FeaturesController.getAll);

/**
 * @swagger
 * /features/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get feature by ID
 *     tags:
 *       - Features
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Feature details
 *       404:
 *         description: Feature not found
 */
router.get("/:id", isAuthenticated, FeaturesController.getById);

/**
 * @swagger
 * /features:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new system feature
 *     tags:
 *       - Features
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - name
 *             properties:
 *               key: { type: string }
 *               name: { type: string }
 *               description: { type: string }
 *               module: { type: string }
 *     responses:
 *       201:
 *         description: Feature created
 */
router.post(
  "/",
  isAuthenticated,
  validate(createFeatureSchema),
  FeaturesController.create,
);

/**
 * @swagger
 * /features/{id}:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a feature
 *     tags:
 *       - Features
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
 *         description: Feature updated
 */
router.patch(
  "/:id",
  isAuthenticated,
  validate(updateFeatureSchema),
  FeaturesController.update,
);

/**
 * @swagger
 * /features/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a feature
 *     tags: [Features]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Feature deleted
 */
router.delete("/:id", isAuthenticated, FeaturesController.delete);

export default router;
