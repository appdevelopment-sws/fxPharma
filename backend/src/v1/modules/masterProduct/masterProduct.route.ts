import { Router } from "express";
import * as masterProduct from "./masterProduct.controller.js";
import { PERMISSIONS } from "@/constants/permissions.js";
import { isAuthenticated } from "@/middlewares/isAuthenticated.js";
import { allowPermissions } from "@/middlewares/isAuthorized.js";
import { attachTenant } from "@/middlewares/tenant.js";

const router = Router();

router.use(isAuthenticated, attachTenant);

router.get(
  "/",
  allowPermissions(PERMISSIONS.MASTER_PRODUCT_READ),
  masterProduct.listProducts,
);
router.get(
  "/:id",
  allowPermissions(PERMISSIONS.MASTER_PRODUCT_READ),
  masterProduct.getProduct,
);
router.post(
  "/",
  allowPermissions(PERMISSIONS.MASTER_PRODUCT_CREATE),
  masterProduct.createProduct,
);
router.patch(
  "/:id",
  allowPermissions(PERMISSIONS.MASTER_PRODUCT_UPDATE),
  masterProduct.updateProduct,
);
router.delete(
  "/:id",
  allowPermissions(PERMISSIONS.MASTER_PRODUCT_DELETE),
  masterProduct.deleteProduct,
);

export default router;
