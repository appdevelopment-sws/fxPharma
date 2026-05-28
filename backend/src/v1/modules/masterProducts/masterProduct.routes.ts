import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { MasterProductController } from "./masterProduct.controller.js";
import { validate } from "@/middlewares/validate.js";
import {
  createMasterProductSchema,
  updateMasterProductSchema,
} from "./masterProduct.validation.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: MasterProducts
 *   description: Master products management
 */

/**
 * @swagger
 * /master-products:
 *   get:
 *     summary: Get all master products
 *     tags: [MasterProducts]
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create a new master product
 *     tags: [MasterProducts]
 *     responses:
 *       201:
 *         description: Success
 */
router.get("/", isAuthenticated, MasterProductController.getAll);

const uploadDir = path.join(os.tmpdir(), "master-product-imports");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) =>
      cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
  }),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (/\.(xlsx|xls|csv)$/i.test(file.originalname)) {
      cb(null, true);
      return;
    }

    cb(new Error("Only .xlsx, .xls, and .csv files are allowed"));
  },
});

router.get(
  "/import-template",
  isAuthenticated,
  MasterProductController.downloadTemplate,
);
router.post(
  "/bulk-import",
  isAuthenticated,
  upload.single("file"),
  MasterProductController.bulkImport,
);

/**
 * @swagger
 * /master-products/{id}:
 *   get:
 *     summary: Get a master product by ID
 *     tags: [MasterProducts]
 *     responses:
 *       200:
 *         description: Success
 *   put:
 *     summary: Update a master product
 *     tags: [MasterProducts]
 *     responses:
 *       200:
 *         description: Success
 *   delete:
 *     summary: Delete a master product
 *     tags: [MasterProducts]
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/:id", isAuthenticated, MasterProductController.getById);

/**
 * @swagger
 * /master-products:
 *   post:
 *     summary: Create a new master product
 *     tags: [MasterProducts]
 *     responses:
 *       201:
 *         description: Success
 */
router.post(
  "/",
  isAuthenticated,
  validate(createMasterProductSchema),
  MasterProductController.create,
);

/**
 * @swagger
 * /master-products/{id}:
 *   put:
 *     summary: Update a master product
 *     tags: [MasterProducts]
 *     responses:
 *       200:
 *         description: Success
 */
router.put(
  "/:id",
  isAuthenticated,
  validate(updateMasterProductSchema),
  MasterProductController.update,
);

/**
 * @swagger
 * /master-products/{id}:
 *   delete:
 *     summary: Delete a master product
 *     tags: [MasterProducts]
 *     responses:
 *       200:
 *         description: Success
 */
router.delete("/:id", isAuthenticated, MasterProductController.delete);

export default router;
