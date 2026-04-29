import { Request, Response, NextFunction } from "express";
import * as organizationService from "./organization.service.js";
import { z } from "zod";

const createOrgSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["PHARMACY", "WHOLESALE"]).default("PHARMACY"),
});

const createBranchSchema = z.object({
  name: z.string().min(2),
  address: z.string().optional(),
});

export const listOrgs = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await organizationService.getAllOrganizations();
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    next(error);
  }
};

export const createOrg = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = createOrgSchema.parse(req.body);
    const data = await organizationService.createNewOrganization(payload);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    next(error);
  }
};

export const getOrgDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const data = await organizationService.getOrganization(id);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    next(error);
  }
};

export const listOrgBranches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const data = await organizationService.getBranches(id);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    next(error);
  }
};

export const createOrgBranch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.params.id as string;
    const payload = createBranchSchema.parse(req.body);
    const data = await organizationService.createNewBranch({
      organizationId,
      ...payload,
    });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    next(error);
  }
};
