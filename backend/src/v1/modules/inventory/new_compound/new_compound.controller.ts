import { Request, Response } from "express";
import { NewCompoundService } from "./new_compound.service.js";
import { catchAsync } from "../../../../utils/catchAsync.js";
import { paginate } from "../../../../utils/pagination.js";

export class NewCompoundController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, (skip, take, search) =>
      NewCompoundService.getAllCompounds(search, skip, take),
    );
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const compound = await NewCompoundService.getCompoundById(
      req.params.id as string,
    );
    if (!compound) {
      return res
        .status(404)
        .json({ success: false, message: "Compound not found" });
    }
    res.json({ success: true, data: compound });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const compound = await NewCompoundService.createCompound(req.body);
    res.status(201).json({ success: true, data: compound });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const compound = await NewCompoundService.updateCompound(
      req.params.id as string,
      req.body,
    );
    res.json({ success: true, data: compound });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    await NewCompoundService.deleteCompound(req.params.id as string);
    res.json({ success: true, message: "Compound deleted successfully" });
  });
}
