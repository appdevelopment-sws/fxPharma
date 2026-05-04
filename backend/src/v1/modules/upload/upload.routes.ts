import { Router } from "express";
import multer from "multer";
import { UploadController } from "./upload.controller.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload management
 */

router.post(
  "/single",
  isAuthenticated,
  upload.single("file"),
  UploadController.uploadSingle,
);

export default router;
