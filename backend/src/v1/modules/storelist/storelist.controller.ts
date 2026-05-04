import { Request, Response } from "express";
import { StoreListService } from "./storelist.service.js";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";

export class StoreListController {
  static list = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, (skip, take, search) =>
      StoreListService.getStores({ search }, skip, take)
    );
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const store = await StoreListService.getStoreById(String(req.params.id));
    res.json({ success: true, data: store });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const store = await StoreListService.createStore(req.body);
    res.status(201).json({ success: true, data: store });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const store = await StoreListService.updateStore(
      String(req.params.id),
      req.body,
    );
    res.json({ success: true, data: store });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    await StoreListService.deleteStore(String(req.params.id));
    res.json({ success: true, message: "Store deleted successfully" });
  });
}
