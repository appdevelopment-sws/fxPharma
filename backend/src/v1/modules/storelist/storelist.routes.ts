import { Router } from "express";
import { StoreListController } from "./storelist.controller.js";
import { validate } from "@/middlewares/validate.js";
import { createStoreListSchema, updateStoreListSchema } from "./storelist.validation.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: StoreList
 *   description: Store management
 */

/**
 * @swagger
 * /storelist:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all stores
 *     tags: [StoreList]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/search'
 *     responses:
 *       200:
 *         description: List of stores
 */
router.get("/", isAuthenticated, StoreListController.getAll);

/**
 * @swagger
 * /storelist/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get store by ID
 *     tags: [StoreList]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Store details
 */
router.get("/:id", isAuthenticated, StoreListController.getById);

/**
 * @swagger
 * /storelist:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new store
 *     tags: [StoreList]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [storeName, ownerFirstName, ownerLastName, ownerEmail, ownerPhone, loginEmail, password, streetAddress, city, state, zipCode, country]
 *     responses:
 *       201:
 *         description: Store created
 */
router.post("/", isAuthenticated, validate(createStoreListSchema), StoreListController.create);

/**
 * @swagger
 * /storelist/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a store
 *     tags: [StoreList]
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
 *         description: Store updated
 */
router.put("/:id", isAuthenticated, validate(updateStoreListSchema), StoreListController.update);

/**
 * @swagger
 * /storelist/{id}/status:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Update store status
 *     tags: [StoreList]
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
router.patch("/:id/status", isAuthenticated, StoreListController.updateStatus);

/**
 * @swagger
 * /storelist/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a store
 *     tags: [StoreList]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Store deleted
 */
router.delete("/:id", isAuthenticated, StoreListController.delete);

export default router;
