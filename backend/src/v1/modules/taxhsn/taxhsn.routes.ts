import { Router } from "express";
import * as taxHsnController from "./taxhsn.controllers.js";

const router = Router();

/**
 * --- Tax Routes ---
 */
router.post("/taxes", taxHsnController.createTax);
router.get("/taxes", taxHsnController.getTaxes);
router.get("/taxes/:id", taxHsnController.getTax);
router.put("/taxes/:id", taxHsnController.updateTax);
router.delete("/taxes/:id", taxHsnController.deleteTax);

/**
 * --- HSN Routes ---
 */
router.post("/hsn", taxHsnController.createHSN);
router.get("/hsn", taxHsnController.getHSNs);
router.get("/hsn/:id", taxHsnController.getHSN);
router.put("/hsn/:id", taxHsnController.updateHSN);
router.delete("/hsn/:id", taxHsnController.deleteHSN);

export default router;
