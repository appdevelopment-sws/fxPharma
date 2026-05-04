import { Request, Response } from "express";
import { SuppliersService } from "./suppliers.service.js";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";

export class SuppliersController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, (skip, take, search) =>
      SuppliersService.getAllSuppliers(search, skip, take),
    );
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const supplier = await SuppliersService.getSupplierById(
      req.params.id as string,
    );
    if (!supplier) {
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found" });
    }
    res.json({ success: true, data: supplier });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const supplier = await SuppliersService.createSupplier(req.body);
    res.status(201).json({ success: true, data: supplier });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const supplier = await SuppliersService.updateSupplier(
      req.params.id as string,
      req.body,
    );
    res.json({ success: true, data: supplier });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    await SuppliersService.deleteSupplier(req.params.id as string);
    res.json({ success: true, message: "Supplier deleted successfully" });
  });
}
