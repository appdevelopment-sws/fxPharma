import ErrorHandler from "../../../../utils/ErrorHandler.js";
import { BrandsRepository } from "./brands.repository.js";
import { buildSearchFilter } from "../../../../utils/prisma.js";

export class BrandsService {
  static async getAllBrands(search?: string, skip?: number, take?: number) {
    const where = buildSearchFilter(search, ["name", "description"]);
    return BrandsRepository.findAll(where, skip, take);
  }

  static async getBrandById(id: string) {
    const brand = await BrandsRepository.findById(id);
    if (!brand) throw new ErrorHandler("Brand not found", 404);
    return brand;
  }

  static async createBrand(data: any) {
    const existing = await BrandsRepository.findByName(data.name);
    if (existing) throw new ErrorHandler("Brand name already exists", 400);
    return BrandsRepository.create(data);
  }

  static async updateBrand(id: string, data: any) {
    await this.getBrandById(id);
    return BrandsRepository.update(id, data);
  }

  static async deleteBrand(id: string) {
    await this.getBrandById(id);
    return BrandsRepository.delete(id);
  }

  static async updateBrandStatus(id: string, status: any) {
    await this.getBrandById(id);
    return BrandsRepository.update(id, { status });
  }
}
