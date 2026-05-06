import { Router } from "express";
import { UnitsController } from "./units.controller.js";
import { validate } from "@/middlewares/validate.js";
import { createUnitSchema, updateUnitSchema } from "./units.validation.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Units
 *   description: Product unit management
 */

/**
 * @swagger
 * /attributes/units:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all units
 *     tags: [Units]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/search'
 *     responses:
 *       200:
 *         description: List of units
 */
router.get("/", isAuthenticated, UnitsController.getAll);

/**
 * @swagger
 * /attributes/units/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get unit by ID
 *     tags: [Units]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unit details
 */
router.get("/:id", isAuthenticated, UnitsController.getById);

/**
 * @swagger
 * /attributes/units:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new unit
 *     tags: [Units]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               shortName: { type: string }
 *               status: { type: string, enum: [ACTIVE, INACTIVE] }
 *     responses:
 *       201:
 *         description: Unit created
 */
router.post(
  "/",
  isAuthenticated,
  validate(createUnitSchema),
  UnitsController.create,
);

/**
 * @swagger
 * /attributes/units/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a unit
 *     tags: [Units]
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
 *         description: Unit updated
 */
router.put(
  "/:id",
  isAuthenticated,
  validate(updateUnitSchema),
  UnitsController.update,
);

/**
 * @swagger
 * /attributes/units/{id}/status:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Update unit status
 *     tags: [Units]
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
router.patch("/:id/status", isAuthenticated, UnitsController.updateStatus);

/**
 * @swagger
 * /attributes/units/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a unit
 *     tags: [Units]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unit deleted
 */
router.delete("/:id", isAuthenticated, UnitsController.delete);

export default router;
