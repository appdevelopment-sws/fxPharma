import { Router } from "express";
import { InventoryController } from "./add_medicine.controller.js";
import { validate } from "@/middlewares/validate.js";
import {
  createInventorySchema,
  updateInventorySchema,
} from "./add_medicine.validation.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory/Medicine management
 */

/**
 * @swagger
 * /inventory/add-medicine:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all inventory items
 *     tags:
 *       - Inventory
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/search'
 *     responses:
 *       200:
 *         description: List of inventory items
 */
router.get("/", isAuthenticated, InventoryController.getAll);

/**
 * @swagger
 * /inventory/add-medicine/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get inventory item by ID
 *     tags:
 *       - Inventory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory item details
 *       404:
 *         description: Inventory item not found
 */
router.get("/:id", isAuthenticated, InventoryController.getById);

/**
 * @swagger
 * /inventory/add-medicine:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new inventory item
 *     tags:
 *       - Inventory
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name: { type: string }
 *               status: { type: string, enum: [CONTINUE, DISCONTINUE] }
 *               manufacturer: { type: string }
 *               saltComposition: { type: string }
 *               category: { type: string }
 *               packing: { type: string }
 *               unit1st: { type: string }
 *               unit2nd: { type: string }
 *               packQty1: { type: integer }
 *               packQty2: { type: integer }
 *               packQty3: { type: integer }
 *               hsnCode: { type: string }
 *               itemType: { type: string }
 *               colorType: { type: string }
 *               decimal: { type: string }
 *               type: { type: string }
 *               localTax: { type: string }
 *               centralTax: { type: string }
 *               sgst: { type: number }
 *               cgst: { type: number }
 *               igst: { type: number }
 *               mrp: { type: number }
 *               purchaseRate: { type: number }
 *               costPerUnit: { type: number }
 *               rateA: { type: number }
 *               rateB: { type: number }
 *               rateC: { type: number }
 *               cer: { type: number }
 *               minQty: { type: integer }
 *               maxQty: { type: integer }
 *               reorderQty: { type: integer }
 *               daysLimit: { type: integer }
 *               convStri: { type: number }
 *               convCas: { type: number }
 *               volumeDiscount: { type: number }
 *               itemDiscount: { type: number }
 *               maxDiscount: { type: number }
 *               minMargin: { type: number }
 *               specialDiscount: { type: number }
 *               purchaseDiscount: { type: number }
 *               isNarcotic: { type: boolean }
 *               isScheduleH: { type: boolean }
 *               isScheduleH1: { type: boolean }
 *               hideProduct: { type: boolean }
 *               negativeStock: { type: boolean }
 *               editRates: { type: boolean }
 *               branchId: { type: string }
 *     responses:
 *       201:
 *         description: Inventory item created
 */
router.post(
  "/",
  isAuthenticated,
  validate(createInventorySchema),
  InventoryController.create,
);

/**
 * @swagger
 * /inventory/add-medicine/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update an inventory item
 *     tags:
 *       - Inventory
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
 *               status: { type: string, enum: [CONTINUE, DISCONTINUE] }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Inventory item updated
 */
router.put(
  "/:id",
  isAuthenticated,
  validate(updateInventorySchema),
  InventoryController.update,
);

/**
 * @swagger
 * /inventory/add-medicine/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete an inventory item
 *     tags:
 *       - Inventory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory item deleted
 */
router.delete("/:id", isAuthenticated, InventoryController.delete);

export default router;
