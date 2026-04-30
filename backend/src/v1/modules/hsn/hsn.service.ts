import ErrorHandler from "../../../utils/ErrorHandler.js";
import { HsnRepository } from "./hsn.repository.js";

export class HsnService {
  static async getAllHsns() {
    return HsnRepository.findAll();
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
    await this.getHsnById(id);
    return HsnRepository.delete(id);
  }
}
