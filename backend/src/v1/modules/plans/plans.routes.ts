import { Router } from "express";
import { PlansController } from "./plans.controller.js";
import { validate } from "@/middlewares/validate.js";
import { createPlanSchema, updatePlanSchema, updatePlanStatusSchema } from "./plans.validation.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Plans
 *   description: Subscription plan management
 */

/**
 * @swagger
 * /plans:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all plans
 *     tags:
 *       - Plans
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: Filter by status (1=Active, 0=Inactive)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of plans
 */
router.get("/", isAuthenticated, PlansController.getAll);

/**
 * @swagger
 * /plans/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get plan by ID
 *     tags:
 *       - Plans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan details
 *       404:
 *         description: Plan not found
 */
router.get("/:id", isAuthenticated, PlansController.getById);

/**
 * @swagger
 * /plans:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new plan
 *     tags:
 *       - Plans
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - name
 *               - price
 *               - billingCycle
 *               - durationDays
 *             properties:
 *               key: { type: string }
 *               name: { type: string }
 *               shortDescription: { type: string }
 *               description: { type: array, items: { type: string } }
 *               price: { type: number }
 *               currency: { type: string }
 *               billingCycle: { type: string, enum: [MONTHLY, QUARTERLY, YEARLY, CUSTOM] }
 *               durationDays: { type: integer }
 *               maxStaff: { type: integer }
 *               maxBranches: { type: integer }
 *               storageLimit: { type: integer }
 *               isPopular: { type: boolean }
 *               badgeText: { type: string }
 *               featureIds: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Plan created
 */
router.post("/", isAuthenticated, validate(createPlanSchema), PlansController.create);

/**
 * @swagger
 * /plans/{id}:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a plan
 *     tags:
 *       - Plans
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
 *         description: Plan updated
 */
router.patch("/:id", isAuthenticated, validate(updatePlanSchema), PlansController.update);

/**
 * @swagger
 * /plans/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a plan
 *     tags:
 *       - Plans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan deleted
 */
router.delete("/:id", isAuthenticated, PlansController.delete);

/**
 * @swagger
 * /plans/{id}/status:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Update plan status (Active/Inactive)
 *     tags:
 *       - Plans
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
 *               - status
 *             properties:
 *               status: { type: integer, enum: [0, 1] }
 *     responses:
 *       200:
 *         description: Plan status updated
 */
router.patch("/:id/status", isAuthenticated, validate(updatePlanStatusSchema), PlansController.updateStatus);

export default router;
