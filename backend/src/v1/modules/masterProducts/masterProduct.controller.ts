import { Request, Response } from "express";
import { MasterProductService } from "./masterProduct.service.js";
import { catchAsync } from "../../../utils/catchAsync.js";
import {
  getPaginationOptions,
  formatPaginatedResponse,
} from "../../../utils/pagination.js";

export class MasterProductController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const { skip, take, page, limit } = getPaginationOptions(req.query);
    const search = (req.query.search as string) || "";
    const status = (req.query.status as string) || "";

    const { data, total } = await MasterProductService.getAllProducts(
      search,
      skip,
      take,
      status || undefined,
    );

    return res.json(
      formatPaginatedResponse(data, total, { skip, take, page, limit }),
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
