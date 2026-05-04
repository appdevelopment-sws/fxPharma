import { Request, Response } from "express";
import { MasterProductService } from "./masterProduct.service.js";
import { catchAsync } from "../../../utils/catchAsync.js";
import {
  getPaginationOptions,
  formatPaginatedResponse,
  paginate,
} from "../../../utils/pagination.js";

export class MasterProductController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, (skip, take, search) =>
      MasterProductService.getAllProducts(search, skip, take),
    );
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const product = await MasterProductService.getProductById(
      req.params.id as string,
    );
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: product });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const product = await MasterProductService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const product = await MasterProductService.updateProduct(
      req.params.id as string,
      req.body,
    );
    res.json({ success: true, data: product });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    await MasterProductService.deleteProduct(req.params.id as string);
    res.json({ success: true, message: "Product deleted successfully" });
  });
}
