import { Router } from "express";
import multer from "multer";
import { uploadController } from "./upload.controller.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
});
/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload management
 */

/**
 * @openapi
 * /api/v1/upload/presigned-url:
 *   get:
 *     summary: Generate Cloudflare R2 presigned PUT URL
 *     description: Request a secure, pre-authorized PUT URL to upload an image directly from the frontend to Cloudflare R2 object storage.
 *     tags: [Upload]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *         example: "product-image.jpg"
 *       - in: query
 *         name: fileType
 *         required: true
 *         schema:
 *           type: string
 *         example: "image/jpeg"
 *     responses:
 *       200:
 *         description: Presigned URL generated successfully
 */
router.get("/presigned-url", isAuthenticated, uploadController.getPresignedUrl);

router.post(
  "/single",
  isAuthenticated,
  upload.single("file"),
  uploadController.uploadSingle,
);

export default router;
