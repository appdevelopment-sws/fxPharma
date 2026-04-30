import { Request, Response } from "express";
import { TaxService } from "./tax.service.js";
import { catchAsync } from "../../../utils/catchAsync.js";

export class TaxController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const taxes = await TaxService.getAllTaxes();
    res.json({ success: true, data: taxes });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const tax = await TaxService.getTaxById(req.params.id as string);
    res.json({ success: true, data: tax });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const tax = await TaxService.createTax(req.body);
    res.status(201).json({ success: true, data: tax });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const tax = await TaxService.updateTax(req.params.id as string, req.body);
    res.json({ success: true, data: tax });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    await TaxService.deleteTax(req.params.id as string);
    res.json({ success: true, message: "Tax rule deleted successfully" });
  });
}
