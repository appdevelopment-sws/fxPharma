import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";
import { buildSearchFilter } from "@/utils/buildSearchFilter.js";
import { rootPrisma } from "@/lib/prisma.js";

export class HsnController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    await paginate(res, req.query, async (skip, take, search) => {
      const where = buildSearchFilter(search, ["hsncode", "description"]);

      const [data, total] = await Promise.all([
        rootPrisma.hsn.findMany({
          where,
          orderBy: { createdAt: "desc" },
          include: {
            hsnMappings: {
              include: { tax: true },
            },
          },
          skip,
          take,
        }),
        rootPrisma.hsn.count({ where }),
      ]);

      return { data, total };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const hsn = await rootPrisma.hsn.findUnique({
      where: { id: req.params.id as string },
      include: {
        hsnMappings: {
          include: { tax: true },
        },
      },
    });

    if (!hsn) {
      throw new ErrorHandler("HSN code not found", 404);
    }

    res.json({
      success: true,
      data: hsn,
    });
  });

  static create = catchAsync(async (req: Request, res: Response) => {
    const { taxIds, ...hsnData } = req.body;

    const existing = await rootPrisma.hsn.findFirst({
      where: { hsncode: hsnData.hsncode },
    });

    if (existing) {
      throw new ErrorHandler("HSN code already exists", 400);
    }

    const hsn = await rootPrisma.$transaction(async (tx) => {
      const created = await tx.hsn.create({
        data: hsnData,
      });

      if (taxIds?.length > 0) {
        await tx.hsnMapping.createMany({
          data: taxIds.map((taxid: string) => ({
            hsnid: created.id,
            taxid,
          })),
        });
      }

      return tx.hsn.findUnique({
        where: { id: created.id },
        include: {
          hsnMappings: {
            include: { tax: true },
          },
        },
      });
    });

    res.status(201).json({
      success: true,
      data: hsn,
    });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const { taxIds, ...hsnData } = req.body;

    const existing = await rootPrisma.hsn.findUnique({
      where: { id: req.params.id as string },
    });

    if (!existing) {
      throw new ErrorHandler("HSN code not found", 404);
    }

    const hsn = await rootPrisma.$transaction(async (tx) => {
      await tx.hsn.update({
        where: { id: req.params.id as string },
        data: hsnData,
      });

      if (taxIds !== undefined) {
        await tx.hsnMapping.deleteMany({
          where: { hsnid: req.params.id as string },
        });

        if (taxIds.length > 0) {
          await tx.hsnMapping.createMany({
            data: taxIds.map((taxid: string) => ({
              hsnid: req.params.id as string,
              taxid,
            })),
          });
        }
      }

      return tx.hsn.findUnique({
        where: { id: req.params.id as string },
        include: {
          hsnMappings: {
            include: { tax: true },
          },
        },
      });
    });

    res.json({
      success: true,
      data: hsn,
    });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    const hsn = await rootPrisma.hsn.findUnique({
      where: { id: req.params.id as string },
      include: {
        hsnMappings: true,
      },
    });

    if (!hsn) {
      throw new ErrorHandler("HSN code not found", 404);
    }

    if (hsn.hsnMappings.length > 0) {
      throw new ErrorHandler(
        "Cannot delete HSN code because it has active tax mappings. Please remove the mappings first.",
        400,
      );
    }

    await rootPrisma.hsn.delete({
      where: { id: req.params.id as string },
    });

    res.json({
      success: true,
      message: "HSN code deleted successfully",
    });
  });
}
