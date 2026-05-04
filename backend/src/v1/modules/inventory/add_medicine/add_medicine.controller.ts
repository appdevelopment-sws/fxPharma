import { Request, Response } from "express";
import { InventoryService } from "./add_medicine.service.js";
import { catchAsync } from "../../../../utils/catchAsync.js";
import { paginate } from "../../../../utils/pagination.js";

export class InventoryController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, (skip, take, search) =>
      InventoryService.getAllInventory(search, skip, take),
    );
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const inventory = await InventoryService.getInventoryById(
      req.params.id as string,
    );
    if (!inventory) {
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found" });
    }
    res.json({ success: true, data: inventory });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const inventory = await InventoryService.createInventory(req.body);
    res.status(201).json({ success: true, data: inventory });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const inventory = await InventoryService.updateInventory(
      req.params.id as string,
      req.body,
    );
    res.json({ success: true, data: inventory });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    await InventoryService.deleteInventory(req.params.id as string);
    res.json({ success: true, message: "Inventory item deleted successfully" });
  });
}
