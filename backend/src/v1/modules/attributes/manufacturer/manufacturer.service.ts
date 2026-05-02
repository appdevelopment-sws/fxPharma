import ErrorHandler from "../../../../utils/ErrorHandler.js";
import { ManufacturerRepository } from "./manufacturer.repository.js";
import { buildSearchFilter } from "../../../../utils/prisma.js";

export class ManufacturerService {
  static async getAllManufacturers(search?: string, skip?: number, take?: number) {
    const where = buildSearchFilter(search, ["name", "email", "phone", "address"]);
    return ManufacturerRepository.findAll(where, skip, take);
  }

  static async getManufacturerById(id: string) {
    const manufacturer = await ManufacturerRepository.findById(id);
    if (!manufacturer) throw new ErrorHandler("Manufacturer not found", 404);
    return manufacturer;
  }

  static async createManufacturer(data: any) {
    const existing = await ManufacturerRepository.findByName(data.name);
    if (existing) throw new ErrorHandler("Manufacturer name already exists", 400);
    return ManufacturerRepository.create(data);
  }

  static async updateManufacturer(id: string, data: any) {
    await this.getManufacturerById(id);
    return ManufacturerRepository.update(id, data);
  }

  static async deleteManufacturer(id: string) {
    await this.getManufacturerById(id);
    return ManufacturerRepository.delete(id);
  }

  static async updateManufacturerStatus(id: string, isActive: boolean) {
    await this.getManufacturerById(id);
    return ManufacturerRepository.update(id, { isActive });
  }
}
