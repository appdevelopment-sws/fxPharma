import { Router } from "express";
import { CategoriesController } from "./categories.controller.js";
import { validate } from "@/middlewares/validate.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./categories.validation.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Product category management
 */

/**
 * @swagger
 * /attributes/categories:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all categories
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/search'
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/", isAuthenticated, CategoriesController.getAll);

/**
 * @swagger
 * /attributes/categories/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 */
router.get("/:id", isAuthenticated, CategoriesController.getById);

/**
 * @swagger
 * /attributes/categories:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new category
 *     tags: [Categories]
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
 *               status: { type: string, enum: [ACTIVE, INACTIVE] }
 *               parentId: { type: string }
 *     responses:
 *       201:
 *         description: Category created
 */
router.post(
  "/",
  isAuthenticated,
  validate(createCategorySchema),
  CategoriesController.create,
);

/**
 * @swagger
 * /attributes/categories/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a category
 *     tags: [Categories]
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
 *         description: Category updated
 */
router.put(
  "/:id",
  isAuthenticated,
  validate(updateCategorySchema),
  CategoriesController.update,
);

/**
 * @swagger
 * /attributes/categories/{id}/status:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Update category status
 *     tags: [Categories]
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
router.patch("/:id/status", isAuthenticated, CategoriesController.updateStatus);

/**
 * @swagger
 * /attributes/categories/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.delete("/:id", isAuthenticated, CategoriesController.delete);

export default router;
