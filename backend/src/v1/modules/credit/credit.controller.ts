import { Request, Response } from "express";
import { catchAsync } from "@/utils/catchAsync.js";
import { getRequestScope } from "@/helpers/requestScope.js";
import { creditService } from "./credit.service.js";
import ErrorHandler from "@/utils/ErrorHandler.js";

export class CreditController {
  // User endpoints
  createRequest = catchAsync(async (req: Request, res: Response) => {
    const { organizationId } = getRequestScope(req);
    const { requestedLimit, paymentScreenshotUrl } = req.body;

    if (!requestedLimit || !paymentScreenshotUrl) {
      throw new ErrorHandler("Requested limit and payment screenshot are required", 400);
    }

    const request = await creditService.createCreditRequest(
      organizationId,
      Number(requestedLimit),
      paymentScreenshotUrl
    );

    res.status(201).json({
      success: true,
      message: "Credit request submitted successfully",
      data: request,
    });
  });

  getLogs = catchAsync(async (req: Request, res: Response) => {
    const { organizationId } = getRequestScope(req);
    const logs = await creditService.getCreditLogs(organizationId);

    res.status(200).json({
      success: true,
      data: logs,
    });
  });

  getMyRequests = catchAsync(async (req: Request, res: Response) => {
    const { organizationId } = getRequestScope(req);
    const requests = await creditService.getCreditRequests(organizationId);

    res.status(200).json({
      success: true,
      data: requests,
    });
  });

  // Admin endpoints
  getAllRequests = catchAsync(async (req: Request, res: Response) => {
    // Assuming admin can see all requests if no organizationId is passed, 
    // or maybe they only see requests for a specific organization if it's a tenant admin.
    // For simplicity, returning all if no orgId is tied to the admin token, or just fetching all.
    const requests = await creditService.getCreditRequests();

    res.status(200).json({
      success: true,
      data: requests,
    });
  });

  approveRequest = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { adminToken } = req.body;

    if (!adminToken) {
      throw new ErrorHandler("Admin token is required", 400);
    }

    const request = await creditService.approveCreditRequest(id as string, adminToken);

    res.status(200).json({
      success: true,
      message: "Credit request approved successfully",
      data: request,
    });
  });

  rejectRequest = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const request = await creditService.rejectCreditRequest(id as string);

    res.status(200).json({
      success: true,
      message: "Credit request rejected",
      data: request,
    });
  });
}

export const creditController = new CreditController();
