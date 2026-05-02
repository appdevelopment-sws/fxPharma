import ErrorHandler from "../../../utils/ErrorHandler.js";
import { TaxRepository } from "./tax.repository.js";

import { buildSearchFilter } from "../../../utils/prisma.js";

export class TaxService {
  static async getAllTaxes(search?: string, skip?: number, take?: number) {
    const where = buildSearchFilter(search, ["name"]);
    return TaxRepository.findAll(where, skip, take);
  }

  static async getTaxById(id: string) {
    const tax = await TaxRepository.findById(id);
    if (!tax) throw new ErrorHandler("Tax rule not found", 404);
    return tax;
  }

  static async createTax(data: any) {
    return TaxRepository.create(data);
  }

  static async updateTax(id: string, data: any) {
    await this.getTaxById(id);
    return TaxRepository.update(id, data);
  }

  static async deleteTax(id: string) {
    const tax = await this.getTaxById(id);
    if (tax.hsnMappings && tax.hsnMappings.length > 0) {
      throw new ErrorHandler(
        "Cannot delete tax rule because it is linked to HSN codes. Please remove the mappings first.",
        400
      );
    }
    return TaxRepository.delete(id);
  }
}
