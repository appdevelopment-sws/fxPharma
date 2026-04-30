import { Request, Response } from "express";
import { PlansService } from "./plans.service.js";
import { catchAsync } from "../../../utils/catchAsync.js";

export class PlansController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const status = req.query.status ? parseInt(req.query.status as string) : undefined;
    const plans = await PlansService.getAllPlans(status);
    res.json({ success: true, data: plans });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const plan = await PlansService.getPlanById(req.params.id as string);
    res.json({ success: true, data: plan });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const plan = await PlansService.createPlan(req.body);
    res.status(201).json({ success: true, data: plan });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const plan = await PlansService.updatePlan(req.params.id as string, req.body);
    res.json({ success: true, data: plan });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    await PlansService.deletePlan(req.params.id as string);
    res.json({ success: true, message: "Plan deleted successfully" });
  });
}
