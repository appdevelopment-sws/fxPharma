import { Router } from "express";
import { PlansController } from "./plans.controller.js";
import { validate } from "@/middlewares/validate.js";
import { createPlanSchema, updatePlanSchema } from "./plans.validation.js";

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
 *     summary: Get all plans
 *     tags: [Plans]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: Filter by status (1=Active, 0=Inactive)
 *     responses:
 *       200:
 *         description: List of plans
 */
router.get("/", PlansController.getAll);

/**
 * @swagger
 * /plans/{id}:
 *   get:
 *     summary: Get plan by ID
 *     tags: [Plans]
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
router.get("/:id", PlansController.getById);

/**
 * @swagger
 * /plans:
 *   post:
 *     summary: Create a new plan
 *     tags: [Plans]
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
router.post("/", validate(createPlanSchema), PlansController.create);

/**
 * @swagger
 * /plans/{id}:
 *   patch:
 *     summary: Update a plan
 *     tags: [Plans]
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
router.patch("/:id", validate(updatePlanSchema), PlansController.update);

/**
 * @swagger
 * /plans/{id}:
 *   delete:
 *     summary: Delete a plan
 *     tags: [Plans]
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
router.delete("/:id", PlansController.delete);

export default router;
