import { Request, Response } from "express";
import { rootPrisma } from "@/lib/prisma.js";
import { catchAsync } from "../../../utils/catchAsync.js";
import { getRequestScope } from "@/helpers/requestScope.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";

export class SettingsController {
  static getSettings = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);

    // Fetch org-level settings (where branchId is null)
    const orgSettings = await rootPrisma.setting.findMany({
      where: { organizationId, branchId: null },
    });

    // Fetch branch-level settings if branchId is present
    let branchSettings: any[] = [];
    if (branchId) {
      branchSettings = await rootPrisma.setting.findMany({
        where: { organizationId, branchId },
      });
    }

    // Merge them: branch overrides organization
    const settingsMap: Record<string, string> = {};
    orgSettings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    branchSettings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    res.json({ success: true, data: settingsMap });
  });

  static saveSettings = catchAsync(async (req: Request, res: Response) => {
    const { organizationId, branchId } = getRequestScope(req);
    const settings = req.body;

    if (typeof settings !== "object" || settings === null) {
      throw new ErrorHandler("Settings data must be an object", 400);
    }

    // Iterate through key-value pairs and upsert
    for (const [key, value] of Object.entries(settings)) {
      const valStr = value !== undefined && value !== null ? String(value) : "";
      
      const existing = await rootPrisma.setting.findFirst({
        where: {
          organizationId,
          branchId: branchId || null,
          key,
        },
      });

      if (existing) {
        await rootPrisma.setting.update({
          where: { id: existing.id },
          data: { value: valStr },
        });
      } else {
        await rootPrisma.setting.create({
          data: {
            organizationId,
            branchId: branchId || null,
            key,
            value: valStr,
          },
        });
      }
    }

    res.json({ success: true, message: "Settings updated successfully" });
  });
}
