import ErrorHandler from "../../../utils/ErrorHandler.js";
import { HsnRepository } from "./hsn.repository.js";

import { buildSearchFilter } from "../../../utils/prisma.js";

export class HsnService {
  static async getAllHsns(search?: string, skip?: number, take?: number) {
    const where = buildSearchFilter(search, ["hsncode", "description"]);
    return HsnRepository.findAll(where, skip, take);
  }

  static async getHsnById(id: string) {
    const hsn = await HsnRepository.findById(id);
    if (!hsn) throw new ErrorHandler("HSN code not found", 404);
    return hsn;
  }

  static async createHsn(data: any) {
    const existing = await HsnRepository.findByCode(data.hsncode);
    if (existing) throw new ErrorHandler("HSN code already exists", 400);
    return HsnRepository.create(data);
  }

  static async updateHsn(id: string, data: any) {
    await this.getHsnById(id);
    return HsnRepository.update(id, data);
  }

  static async deleteHsn(id: string) {
    const hsn = await this.getHsnById(id);
    if (hsn.hsnMappings && hsn.hsnMappings.length > 0) {
      throw new ErrorHandler(
        "Cannot delete HSN code because it has active tax mappings. Please remove the mappings first.",
        400,
      );
    }
    return HsnRepository.delete(id);
  }
}
