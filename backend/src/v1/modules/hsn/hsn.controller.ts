import { Request, Response } from "express";
import { HsnService } from "./hsn.service.js";
import { catchAsync } from "../../../utils/catchAsync.js";

import { paginate } from "../../../utils/pagination.js";

export class HsnController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, (skip, take, search) =>
      HsnService.getAllHsns(search, skip, take)
    );
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const hsn = await HsnService.getHsnById(req.params.id as string);
    res.json({ success: true, data: hsn });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const hsn = await HsnService.createHsn(req.body);
    res.status(201).json({ success: true, data: hsn });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const hsn = await HsnService.updateHsn(req.params.id as string, req.body);
    res.json({ success: true, data: hsn });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    await HsnService.deleteHsn(req.params.id as string);
    res.json({ success: true, message: "HSN code deleted successfully" });
  });
}
