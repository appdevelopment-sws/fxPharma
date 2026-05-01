import ErrorHandler from "../../../utils/ErrorHandler.js";
import { HsnMappingRepository } from "./hsnmapping.repository.js";

import { buildSearchFilter } from "../../../utils/prisma.js";

export class HsnMappingService {
  static async getAllMappings(search?: string, skip?: number, take?: number) {
    const where = buildSearchFilter(search, []); // No direct searchable fields
    return HsnMappingRepository.findAll(where, skip, take);
  }

  static async getMappingById(id: string) {
    const mapping = await HsnMappingRepository.findById(id);
    if (!mapping) throw new ErrorHandler("Mapping not found", 404);
    return mapping;
  }

  static async createMapping(data: { hsnid: string; taxid: string }) {
    const existing = await HsnMappingRepository.findByHsnAndTax(data.hsnid, data.taxid);
    if (existing) throw new ErrorHandler("This HSN-Tax mapping already exists", 400);
    return HsnMappingRepository.create(data);
  }

  static async deleteMapping(id: string) {
    await this.getMappingById(id);
    return HsnMappingRepository.delete(id);
  }
}
