import ErrorHandler from "../../../../utils/ErrorHandler.js";
import { UnitsRepository } from "./units.repository.js";
import { buildSearchFilter } from "../../../../utils/prisma.js";

export class UnitsService {
  static async getAllUnits(search?: string, skip?: number, take?: number) {
    const where = buildSearchFilter(search, ["name", "shortName"]);
    return UnitsRepository.findAll(where, skip, take);
  }

  static async getUnitById(id: string) {
    const unit = await UnitsRepository.findById(id);
    if (!unit) throw new ErrorHandler("Unit not found", 404);
    return unit;
  }

  static async createUnit(data: any) {
    const existing = await UnitsRepository.findByName(data.name);
    if (existing) throw new ErrorHandler("Unit name already exists", 400);
    return UnitsRepository.create(data);
  }

  static async updateUnit(id: string, data: any) {
    await this.getUnitById(id);
    return UnitsRepository.update(id, data);
  }

  static async deleteUnit(id: string) {
    await this.getUnitById(id);
    return UnitsRepository.delete(id);
  }

  static async updateUnitStatus(id: string, status: any) {
    await this.getUnitById(id);
    return UnitsRepository.update(id, { status });
  }
}
