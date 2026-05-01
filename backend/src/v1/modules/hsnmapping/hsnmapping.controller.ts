import { Request, Response } from "express";
import { HsnMappingService } from "./hsnmapping.service.js";
import { catchAsync } from "../../../utils/catchAsync.js";

import { paginate } from "../../../utils/pagination.js";

export class HsnMappingController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, (skip, take, search) =>
      HsnMappingService.getAllMappings(search, skip, take)
    );
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const mapping = await HsnMappingService.getMappingById(req.params.id as string);
    res.json({ success: true, data: mapping });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const mapping = await HsnMappingService.createMapping(req.body);
    res.status(201).json({ success: true, data: mapping });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    await HsnMappingService.deleteMapping(req.params.id as string);
    res.json({ success: true, message: "Mapping deleted successfully" });
  });
}
