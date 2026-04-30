import ErrorHandler from "../../../utils/ErrorHandler.js";
import { TaxRepository } from "./tax.repository.js";

export class TaxService {
  static async getAllTaxes() {
    return TaxRepository.findAll();
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
    await this.getTaxById(id);
    return TaxRepository.delete(id);
  }
}
