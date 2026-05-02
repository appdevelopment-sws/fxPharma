import { Request, Response } from "express";
import { BrandsService } from "./brands.service.js";
import { catchAsync } from "../../../../utils/catchAsync.js";
import { paginate } from "../../../../utils/pagination.js";

export class BrandsController {
    static getAll = catchAsync(async (req: Request, res: Response) => {
        await paginate(res, req.query, (skip, take, search) =>
            BrandsService.getAllBrands(search, skip, take)
        );
    });

    static getById = catchAsync(async (req: Request, res: Response) => {
        const brand = await BrandsService.getBrandById(req.params.id as string);
        res.json({ success: true, data: brand });
    });

    static create = catchAsync(async (req: Request, res: Response) => {
        console.log("Create Brand Request Body:", JSON.stringify(req.body, null, 2));
        const brand = await BrandsService.createBrand(req.body);
        res.status(201).json({ success: true, data: brand });
    });

    static update = catchAsync(async (req: Request, res: Response) => {
        const brand = await BrandsService.updateBrand(req.params.id as string, req.body);
        res.json({ success: true, data: brand });
    });

    static delete = catchAsync(async (req: Request, res: Response) => {
        await BrandsService.deleteBrand(req.params.id as string);
        res.json({ success: true, message: "Brand deleted successfully" });
    });

    static updateStatus = catchAsync(async (req: Request, res: Response) => {
        const brand = await BrandsService.updateBrandStatus(req.params.id as string, req.body.isActive);
        res.json({ success: true, data: brand });
    });
}
