import { Router } from "express";

import { isAuthenticated } from "@/middlewares/isAuthenticated.js";
import { validate } from "@/middlewares/validate.js";

import { UsersController } from "./users.controller.js";
import { createUserSchema, updateUserSchema } from "./user.validation.js";

const router = Router();

router.get("/", isAuthenticated, UsersController.getAll);
router.get("/:id", isAuthenticated, UsersController.getById);
router.post(
  "/",
  isAuthenticated,
  validate(createUserSchema),
  UsersController.create,
);
router.put(
  "/:id",
  isAuthenticated,
  validate(updateUserSchema),
  UsersController.update,
);
router.delete("/:id", isAuthenticated, UsersController.delete);

export default router;
