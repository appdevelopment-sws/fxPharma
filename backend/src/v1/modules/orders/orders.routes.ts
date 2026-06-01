import { Router } from "express";
import { OrdersController } from "./orders.controller.js";
import { validate } from "@/middlewares/validate.js";
import { createOrderSchema, updateOrderSchema } from "./orders.validation.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/", isAuthenticated, OrdersController.getAll);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get order by ID
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/:id", isAuthenticated, OrdersController.getById);

/**
 * @swagger
 * /orders:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new order
 *     tags: [Orders]
 *     responses:
 *       201:
 *         description: Success
 */
router.post(
  "/",
  isAuthenticated,
  validate(createOrderSchema),
  OrdersController.create,
);

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update an order
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Success
 */
router.put(
  "/:id",
  isAuthenticated,
  validate(updateOrderSchema),
  OrdersController.update,
);

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete an order
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Success
 */
router.delete("/:id", isAuthenticated, OrdersController.delete);

router.post(
  "/:id/parse-bill",
  isAuthenticated,
  upload.single("bill"),
  OrdersController.parseBill
);

export default router;
