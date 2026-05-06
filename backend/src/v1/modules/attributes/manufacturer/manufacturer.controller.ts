import { Request, Response } from "express";
import { ManufacturerService } from "./manufacturer.service.js";
import { catchAsync } from "../../../../utils/catchAsync.js";
import { paginate } from "../../../../utils/pagination.js";

export class ManufacturerController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, (skip, take, search) =>
      ManufacturerService.getAllManufacturers(search, skip, take),
    );
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const manufacturer = await ManufacturerService.getManufacturerById(
      req.params.id as string,
    );
    res.json({ success: true, data: manufacturer });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const manufacturer = await ManufacturerService.createManufacturer(req.body);
    res.status(201).json({ success: true, data: manufacturer });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const manufacturer = await ManufacturerService.updateManufacturer(
      req.params.id as string,
      req.body,
    );
    res.json({ success: true, data: manufacturer });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    await ManufacturerService.deleteManufacturer(req.params.id as string);
    res.json({ success: true, message: "Manufacturer deleted successfully" });
  });

  static updateStatus = catchAsync(async (req: Request, res: Response) => {
    const manufacturer = await ManufacturerService.updateManufacturerStatus(
      req.params.id as string,
      req.body.status,
    );
    res.json({ success: true, data: manufacturer });
  });
}
