import express from "express";
import * as organizationController from "./organization.controller.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";
import { allowRoles, allowPermissions } from "@/middlewares/isAuthorized.js";

const router = express.Router();

// Superadmin only routes
router.get(
  "/",
  isAuthenticated,
  allowRoles("super_admin"),
  organizationController.listOrgs
);

router.post(
  "/",
  isAuthenticated,
  allowRoles("super_admin"),
  organizationController.createOrg
);

// Organization/Branch details - Scoped
router.get(
  "/:id",
  isAuthenticated,
  allowPermissions("organizations.view"), // Assume this permission exists
  organizationController.getOrgDetails
);

router.get(
  "/:id/branches",
  isAuthenticated,
  allowPermissions("branches.view"),
  organizationController.listOrgBranches
);

router.post(
  "/:id/branches",
  isAuthenticated,
  allowPermissions("branches.create"),
  organizationController.createOrgBranch
);

export default router;
