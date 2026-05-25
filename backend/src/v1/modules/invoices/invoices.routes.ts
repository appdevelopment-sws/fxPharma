import { Router } from "express";
import { InvoicesController } from "./invoices.controller.js";
import { validate } from "@/middlewares/validate.js";
import { createInvoiceSchema } from "./invoices.validation.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";

const router = Router();

router.get("/", isAuthenticated, InvoicesController.getAll);
router.get("/stats", isAuthenticated, InvoicesController.getStats);
router.get("/gst-summary", isAuthenticated, InvoicesController.getGstSummary);
router.get("/templates", isAuthenticated, InvoicesController.getTemplates);
router.get("/:id/download", isAuthenticated, InvoicesController.download);
router.get("/:id", isAuthenticated, InvoicesController.getById);
router.post(
  "/",
  isAuthenticated,
  validate(createInvoiceSchema),
  InvoicesController.create
);

export default router;
