import { Request, Response } from "express";
import { catchAsync } from "../../../utils/catchAsync.js";
import { paginate } from "../../../utils/pagination.js";
import { buildSearchFilter } from "@/utils/buildSearchFilter.js";
import { rootPrisma } from "@/lib/prisma.js";

export class PlansController {
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const status = req.query.status
      ? parseInt(req.query.status as string)
      : undefined;
    await paginate(res, req.query, async (skip, take, search) => {
      const where = {
        ...(status !== undefined && { status }),
        ...buildSearchFilter(search),
      };
      const [data, total] = await Promise.all([
        rootPrisma.plan.findMany({
          where: where,
          include: {
            features: {
              include: {
                feature: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          ...(skip !== undefined && { skip }),
          ...(take !== undefined && { take }),
        }),
        rootPrisma.plan.count({ where: where }),
      ]);
      return { data, total };
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const plan = await rootPrisma.plan.findUnique({
      where: { id: req.params.id as string },
      include: {
        features: {
          include: {
            feature: true,
          },
        },
      },
    });
    res.json({ success: true, data: plan });
  });
  static create = catchAsync(async (req: Request, res: Response) => {
    const { featureIds, ...planData } = req.body;

    const plan = await rootPrisma.plan.create({
      data: {
        ...planData,

        features: {
          create: (featureIds || []).map((id: string) => ({
            feature: {
              connect: { id },
            },
          })),
        },
      },

      include: {
        features: {
          include: {
            feature: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: plan,
    });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const { featureIds, ...planData } = req.body;

    const plan = await rootPrisma.plan.update({
      where: { id: req.params.id as string },
      data: {
        ...planData,

        ...(featureIds && {
          features: {
            deleteMany: {},

            create: featureIds.map((featureId: string) => ({
              feature: {
                connect: { id: featureId },
              },
            })),
          },
        }),
      },

      include: {
        features: {
          include: {
            feature: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: plan,
    });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    await rootPrisma.plan.delete({
      where: { id: req.params.id as string },
    });
    res.json({ success: true, message: "Plan deleted successfully" });
  });

  static updateStatus = catchAsync(async (req: Request, res: Response) => {
    const plan = await rootPrisma.plan.update({
      where: { id: req.params.id as string },
      data: { status: req.body.status },
    });
    res.json({ success: true, data: plan });
  });
}
