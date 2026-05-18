import { Router } from "express";

import { isAuthenticated } from "@/middlewares/isAuthenticated.js";
import { validate } from "@/middlewares/validate.js";

import { BranchesController } from "./branches.controller.js";
import {
  createBranchSchema,
  updateBranchSchema,
} from "./branch.validation.js";

const router = Router();

router.get("/", isAuthenticated, BranchesController.getAll);
router.get("/:id", isAuthenticated, BranchesController.getById);
router.post(
  "/",
  isAuthenticated,
  validate(createBranchSchema),
  BranchesController.create,
);
router.put(
  "/:id",
  isAuthenticated,
  validate(updateBranchSchema),
  BranchesController.update,
);
router.delete("/:id", isAuthenticated, BranchesController.delete);

export default router;
