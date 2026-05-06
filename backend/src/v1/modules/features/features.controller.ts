import { Request, Response } from "express";
import { FeaturesService } from "./features.service.js";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";

export class FeaturesController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, (skip, take, search) =>
      FeaturesService.getAllFeatures(search, skip, take),
    );
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const feature = await FeaturesService.getFeatureById(
      req.params.id as string,
    );
    res.json({ success: true, data: feature });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const feature = await FeaturesService.createFeature(req.body);
    res.status(201).json({ success: true, data: feature });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const feature = await FeaturesService.updateFeature(
      req.params.id as string,
      req.body,
    );
    res.json({ success: true, data: feature });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    await FeaturesService.deleteFeature(req.params.id as string);
    res.json({ success: true, message: "Feature deleted successfully" });
  });
}
