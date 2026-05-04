import { Router } from "express";
import { SuppliersController } from "./suppliers.controller.js";
import { validate } from "@/middlewares/validate.js";
import { createSupplierSchema, updateSupplierSchema } from "./suppliers.validation.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Suppliers
 *   description: Supplier management
 */

/**
 * @swagger
 * /suppliers:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all suppliers
 *     tags:
 *       - Suppliers
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/search'
 *     responses:
 *       200:
 *         description: List of suppliers
 */
router.get("/", isAuthenticated, SuppliersController.getAll);

/**
 * @swagger
 * /suppliers/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get supplier by ID
 *     tags:
 *       - Suppliers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Supplier details
 *       404:
 *         description: Supplier not found
 */
router.get("/:id", isAuthenticated, SuppliersController.getById);

/**
 * @swagger
 * /suppliers:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new supplier
 *     tags:
 *       - Suppliers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - gstNumber
 *               - officeAddress
 *               - contactPersonName
 *               - email
 *               - phone
 *               - whatsappNumber
 *             properties:
 *               companyName: { type: string }
 *               gstNumber: { type: string }
 *               officeAddress: { type: string }
 *               registrationDocuments: { type: string }
 *               contactPersonName: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               whatsappNumber: { type: string }
 *               isPreferred: { type: boolean }
 *               autoGeneratePO: { type: boolean }
 *     responses:
 *       201:
 *         description: Supplier created
 */
router.post("/", isAuthenticated, validate(createSupplierSchema), SuppliersController.create);

/**
 * @swagger
 * /suppliers/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Update a supplier
 *     tags:
 *       - Suppliers
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
 *               companyName: { type: string }
 *               gstNumber: { type: string }
 *               officeAddress: { type: string }
 *               registrationDocuments: { type: string }
 *               contactPersonName: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               whatsappNumber: { type: string }
 *               isPreferred: { type: boolean }
 *               autoGeneratePO: { type: boolean }
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Supplier updated
 */
router.put("/:id", isAuthenticated, validate(updateSupplierSchema), SuppliersController.update);

/**
 * @swagger
 * /suppliers/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a supplier
 *     tags:
 *       - Suppliers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Supplier deleted
 */
router.delete("/:id", isAuthenticated, SuppliersController.delete);

export default router;
