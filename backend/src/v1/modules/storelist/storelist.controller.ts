import { Request, Response } from "express";
import { StoreListService } from "./storelist.service.js";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";

export class StoreListController {
    static getAll = catchAsync(async (req: Request, res: Response) => {
        await paginate(res, req.query, (skip, take, search) =>
            StoreListService.getAllStores(search, skip, take)
        );
    });

    static getById = catchAsync(async (req: Request, res: Response) => {
        const store = await StoreListService.getStoreById(req.params.id as string);
        res.json({ success: true, data: store });
    });

    static create = catchAsync(async (req: Request, res: Response) => {
        const store = await StoreListService.createStore(req.body);
        res.status(201).json({ success: true, data: store });
    });

    static update = catchAsync(async (req: Request, res: Response) => {
        const store = await StoreListService.updateStore(req.params.id as string, req.body);
        res.json({ success: true, data: store });
    });

    static delete = catchAsync(async (req: Request, res: Response) => {
        await StoreListService.deleteStore(req.params.id as string);
        res.json({ success: true, message: "Store deleted successfully" });
    });

    static updateStatus = catchAsync(async (req: Request, res: Response) => {
        const store = await StoreListService.updateStoreStatus(req.params.id as string, req.body.isActive);
        res.json({ success: true, data: store });
    });
}
