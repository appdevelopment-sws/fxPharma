import { Router } from "express";
import { StoreListController } from "./storelist.controller.js";
import { validate } from "@/middlewares/validate.js";
import {
  createStoreSchema,
  updateStoreSchema,
} from "./storelist.validation.js";

const router = Router();

router.post("/", validate(createStoreSchema), StoreListController.create);
router.get("/meta", StoreListController.meta);
router.get("/", StoreListController.list);
router.get("/:id", StoreListController.getById);
router.put("/:id", validate(updateStoreSchema), StoreListController.update);
router.delete("/:id", StoreListController.delete);

export default router;
