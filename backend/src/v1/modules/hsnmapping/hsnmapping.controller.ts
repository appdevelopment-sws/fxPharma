import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";
import { buildSearchFilter } from "@/utils/buildSearchFilter.js";
import { rootPrisma } from "@/lib/prisma.js";

export class HsnMappingController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    await paginate(res, req.query, async (skip, take, search) => {
      const searchFilter = buildSearchFilter(search, []);
      const where: any = {
        AND: [
          searchFilter,
          {
            hsn: {
              OR: [
                { isGlobal: true },
                { createdById: userId || null },
              ]
            }
          }
        ]
      };

      if (search) {
        where.AND.push({
          OR: [
            {
              hsn: {
                hsncode: { contains: search, mode: "insensitive" }
              }
            },
            {
              tax: {
                name: { contains: search, mode: "insensitive" }
              }
            }
          ]
        });
      }

      const [data, total] = await Promise.all([
        rootPrisma.hsnMapping.findMany({
          where,
          include: {
            hsn: true,
            tax: true,
          },
          orderBy: { createdAt: "desc" },
          skip,
          take,
        }),
        rootPrisma.hsnMapping.count({ where }),
      ]);

      return { data, total };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const mapping = await rootPrisma.hsnMapping.findUnique({
      where: { id: req.params.id as string },
      include: {
        hsn: true,
        tax: true,
      },
    });

    if (!mapping) {
      throw new ErrorHandler("Mapping not found", 404);
    }

    if (!mapping.hsn.isGlobal && mapping.hsn.createdById !== userId) {
      throw new ErrorHandler("Unauthorized access to this mapping", 403);
    }

    res.json({
      success: true,
      data: mapping,
    });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const { hsnid, taxid, effectiveFrom, effectiveTo } = req.body;
    const userId = (req as any).user?.id;

    const hsn = await rootPrisma.hsn.findFirst({
      where: {
        id: hsnid,
        OR: [
          { isGlobal: true },
          { createdById: userId || null }
        ]
      }
    });

    if (!hsn) {
      throw new ErrorHandler("HSN code not found or access denied", 404);
    }

    const existing = await rootPrisma.hsnMapping.findUnique({
      where: {
        hsnid_taxid: { hsnid, taxid },
      },
    });

    if (existing) {
      throw new ErrorHandler("This HSN-Tax mapping already exists", 400);
    }

    const mapping = await rootPrisma.hsnMapping.create({
      data: {
        hsnid,
        taxid,
        effectiveFrom,
        effectiveTo,
        isGlobal: hsn.isGlobal,
      },
      include: {
        hsn: true,
        tax: true,
      },
    });

    res.status(201).json({
      success: true,
      data: mapping,
    });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { hsnid, taxid, effectiveFrom, effectiveTo } = req.body;

    const existingMapping = await rootPrisma.hsnMapping.findUnique({
      where: { id: req.params.id as string },
      include: { hsn: true }
    });

    if (!existingMapping) {
      throw new ErrorHandler("Mapping not found", 404);
    }

    if (!existingMapping.hsn.isGlobal && existingMapping.hsn.createdById !== userId) {
      throw new ErrorHandler("Unauthorized access to this mapping", 403);
    }

    if (hsnid && hsnid !== existingMapping.hsnid) {
      const newHsn = await rootPrisma.hsn.findFirst({
        where: {
          id: hsnid,
          OR: [
            { isGlobal: true },
            { createdById: userId || null }
          ]
        }
      });
      if (!newHsn) {
        throw new ErrorHandler("New HSN code not found or access denied", 404);
      }
    }

    const mapping = await rootPrisma.hsnMapping.update({
      where: { id: req.params.id as string },
      data: {
        hsnid,
        taxid,
        effectiveFrom,
        effectiveTo,
      },
      include: {
        hsn: true,
        tax: true,
      },
    });

    res.json({
      success: true,
      data: mapping,
    });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    const mapping = await rootPrisma.hsnMapping.findUnique({
      where: { id: req.params.id as string },
      include: { hsn: true }
    });

    if (!mapping) {
      throw new ErrorHandler("Mapping not found", 404);
    }

    if (!mapping.hsn.isGlobal && mapping.hsn.createdById !== userId) {
      throw new ErrorHandler("Unauthorized access to this mapping", 403);
    }

    await rootPrisma.hsnMapping.delete({
      where: { id: req.params.id as string },
    });

    res.json({
      success: true,
      message: "Mapping deleted successfully",
    });
  });
}
