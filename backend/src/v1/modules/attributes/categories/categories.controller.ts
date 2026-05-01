import { Request, Response } from "express";
import { CategoriesService } from "./categories.service.js";
import { catchAsync } from "../../../../utils/catchAsync.js";
import { paginate } from "../../../../utils/pagination.js";

export class CategoriesController {
    static getAll = catchAsync(async (req: Request, res: Response) => {
        await paginate(res, req.query, (skip, take, search) =>
            CategoriesService.getAllCategories(search, skip, take)
        );
    });

    static getById = catchAsync(async (req: Request, res: Response) => {
        const category = await CategoriesService.getCategoryById(req.params.id as string);
        res.json({ success: true, data: category });
    });

    static create = catchAsync(async (req: Request, res: Response) => {
        const category = await CategoriesService.createCategory(req.body);
        res.status(201).json({ success: true, data: category });
    });

    static update = catchAsync(async (req: Request, res: Response) => {
        const category = await CategoriesService.updateCategory(req.params.id as string, req.body);
        res.json({ success: true, data: category });
    });

    static delete = catchAsync(async (req: Request, res: Response) => {
        await CategoriesService.deleteCategory(req.params.id as string);
        res.json({ success: true, message: "Category deleted successfully" });
    });

    static updateStatus = catchAsync(async (req: Request, res: Response) => {
        const category = await CategoriesService.updateCategoryStatus(req.params.id as string, req.body.isActive);
        res.json({ success: true, data: category });
    });
}
