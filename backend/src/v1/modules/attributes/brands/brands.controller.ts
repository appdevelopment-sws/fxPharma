import { Request, Response } from "express";
import { catchAsync } from "../../../../utils/catchAsync.js";
import { paginate } from "../../../../utils/pagination.js";
import ErrorHandler from "../../../../utils/ErrorHandler.js";
import { buildSearchFilter } from "@/utils/buildSearchFilter.js";
import { rootPrisma } from "@/lib/prisma.js";
import { getRequestScope } from "@/helpers/requestScope.js";

export class BrandsController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId, role, isSuperAdmin } =
      getRequestScope(req);
    const includeGlobal = req.query.includeGlobal === "true" || isSuperAdmin;
    console.log("Requesting brands with scope:", {
      organizationId,
      isSuperAdmin,
    });
    await paginate(res, req.query, async (skip, take, search) => {
      const searchFilter = buildSearchFilter(search, ["name", "description"]);

      const where = {
        AND: [
          {
            OR: includeGlobal
              ? [
                  {
                    organizationId,
                    ...(branchId ? { branchId } : {}),
                  },
                  {
                    isGlobal: true,
                  },
                ]
              : [
                  {
                    organizationId,
                    ...(branchId ? { branchId } : {}),
                  },
                ],
          },
          ...(search ? [searchFilter] : []),
        ],
      };

      const [data, total] = await Promise.all([
        rootPrisma.brand.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),

        rootPrisma.brand.count({ where }),
      ]);

      return { data, total };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const brand = await rootPrisma.brand.findFirst({
      where: {
        id: req.params.id as string,
        organizationId,
        ...(branchId ? { branchId } : {}),
      },
    });

    if (!brand) {
      throw new ErrorHandler("Brand not found", 404);
    }

    res.json({
      success: true,
      data: brand,
    });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId, isSuperAdmin } = getRequestScope(req);
    console.log("Creating brand with scope:", {
      organizationId,
      isSuperAdmin,
    });
    const existing = await rootPrisma.brand.findFirst({
      where: {
        name: req.body.name,
        organizationId,
        ...(branchId ? { branchId } : {}),
      },
    });

    if (existing) {
      throw new ErrorHandler("Brand name already exists", 400);
    }

    const brand = await rootPrisma.brand.create({
      data: {
        ...req.body,
        organizationId,
        branchId,
        isGlobal: isSuperAdmin,
      },
    });

    res.status(201).json({
      success: true,
      data: brand,
    });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const existing = await rootPrisma.brand.findFirst({
      where: {
        id: req.params.id as string,
        organizationId,
        ...(branchId ? { branchId } : {}),
      },
    });

    if (!existing) {
      throw new ErrorHandler("Brand not found", 404);
    }

    const {
      id,
      createdAt,
      updatedAt,
      organizationId: orgId,
      branchId: brId,
      ...data
    } = req.body;

    const brand = await rootPrisma.brand.update({
      where: { id: req.params.id as string },
      data,
    });

    res.json({
      success: true,
      data: brand,
    });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const brand = await rootPrisma.brand.findFirst({
      where: {
        id: req.params.id as string,
        organizationId,
        ...(branchId ? { branchId } : {}),
      },
    });

    if (!brand) {
      throw new ErrorHandler("Brand not found", 404);
    }

    await rootPrisma.brand.delete({
      where: { id: req.params.id as string },
    });

    res.json({
      success: true,
      message: "Brand deleted successfully",
    });
  });

  static updateStatus = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    const brand = await rootPrisma.brand.findFirst({
      where: {
        id: req.params.id as string,
        organizationId,
        ...(branchId ? { branchId } : {}),
      },
    });

    if (!brand) {
      throw new ErrorHandler("Brand not found", 404);
    }

    const updated = await rootPrisma.brand.update({
      where: { id: req.params.id as string },
      data: {
        status: req.body.status,
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  });
}
