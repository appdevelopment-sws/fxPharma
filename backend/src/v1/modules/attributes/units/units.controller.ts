import { Request, Response } from "express";
import { UnitsService } from "./units.service.js";
import { catchAsync } from "../../../../utils/catchAsync.js";
import { paginate } from "../../../../utils/pagination.js";

export class UnitsController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, (skip, take, search) =>
      UnitsService.getAllUnits(search, skip, take)
    );
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const unit = await UnitsService.getUnitById(req.params.id as string);
    res.json({ success: true, data: unit });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const unit = await UnitsService.createUnit(req.body);
    res.status(201).json({ success: true, data: unit });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const unit = await UnitsService.updateUnit(req.params.id as string, req.body);
    res.json({ success: true, data: unit });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    await UnitsService.deleteUnit(req.params.id as string);
    res.json({ success: true, message: "Unit deleted successfully" });
  });

  static updateStatus = catchAsync(async (req: Request, res: Response) => {
    const unit = await UnitsService.updateUnitStatus(req.params.id as string, req.body.status);
    res.json({ success: true, data: unit });
  });
}
