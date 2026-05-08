import { Router } from "express";
import { StoreListController } from "./storelist.controller.js";
import { validate } from "@/middlewares/validate.js";
import {
  createStoreSchema,
  updateStoreSchema,
} from "./storelist.validation.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";
import { attachTenant } from "@/middlewares/tenant.js";

const router = Router();

router.post(
  "/",
  validate(createStoreSchema),
  attachTenant,
  StoreListController.create,
);
router.get("/", isAuthenticated, attachTenant, StoreListController.list);
router.get("/:id", isAuthenticated, attachTenant, StoreListController.getById);
router.put(
  "/:id",
  validate(updateStoreSchema),
  isAuthenticated,
  attachTenant,
  StoreListController.update,
);
router.delete(
  "/:id",
  isAuthenticated,
  attachTenant,
  StoreListController.delete,
);

export default router;
