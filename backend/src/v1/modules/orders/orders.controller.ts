import { Request, Response } from "express";
import { OrdersService } from "./orders.service.js";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";

export class OrdersController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, (skip, take, search) =>
      OrdersService.getAllOrders(search, skip, take),
    );
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const order = await OrdersService.getOrderById(req.params.id as string);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, data: order });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const order = await OrdersService.createOrder(req.body);
    res.status(201).json({ success: true, data: order });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const order = await OrdersService.updateOrder(
      req.params.id as string,
      req.body,
    );
    res.json({ success: true, data: order });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    await OrdersService.deleteOrder(req.params.id as string);
    res.json({ success: true, message: "Order deleted successfully" });
  });
}
