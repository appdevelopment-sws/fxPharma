import { Router, Response } from "express";
import { isAuthenticated, AuthRequest } from "@/middlewares/isAuthenticated.js";
import { ensurePermission } from "@/middlewares/ensurePermission.js";

const router = Router();

/**
 * DEMO ROUTE 1: View Branch Inventory
 * Logic: Checks for 'inventory.view' permission scoped to the Branch ID
 * provided in 'x-branch-id' header.
 *
 * Example Usage:
 * URL: GET /api/v1/demo/inventory
 * Header: x-branch-id: <id_of_downtown_branch>
 */
router.get(
  "/inventory",
  isAuthenticated,
  ensurePermission("inventory.view"),
  (req: AuthRequest, res: Response) => {
    const branchId = req.headers["x-branch-id"];
    res.json({
      success: true,
      message: `You have permission to view inventory for branch: ${branchId}`,
      data: {
        stock: [
          { item: "Paracetamol", quantity: 50 },
          { item: "Amoxicillin", quantity: 25 },
        ],
      },
    });
  },
);

/**
 * DEMO ROUTE 2: Manage Organization (Global)
 * Logic: Checks for 'organizations.manage' permission. If no x-branch-id
 * is provided, it defaults to a Global scope check.
 */
router.get(
  "/settings",
  isAuthenticated,
  ensurePermission("organizations.manage"),
  (req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      message: "You have GLOBAL permission to manage organizational settings.",
      data: {
        config: {
          currency: "USD",
          timezone: "UTC",
        },
      },
    });
  },
);

/**
 * DEMO ROUTE 3: Direct Override Test
 * Logic: Checks for a permission that might be granted or revoked directly
 * for a user, bypassing their role.
 */
router.get(
  "/special-op",
  isAuthenticated,
  ensurePermission("users.delete"),
  (req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      message:
        "You have permission to perform a special user deletion operation.",
    });
  },
);

export default router;
