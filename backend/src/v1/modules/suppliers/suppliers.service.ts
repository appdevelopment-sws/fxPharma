import { SuppliersRepository } from "./suppliers.repository.js";

export class SuppliersService {
  static async getAllSuppliers(search?: string, skip?: number, take?: number) {
    const filters: any = {};
    if (search) {
      filters.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { contactPersonName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    return SuppliersRepository.findAll(filters, skip, take);
  }

  static async getSupplierById(id: string) {
    return SuppliersRepository.findById(id);
  }

  static async createSupplier(data: any) {
    return SuppliersRepository.create(data);
  }

  static async updateSupplier(id: string, data: any) {
    return SuppliersRepository.update(id, data);
  }

  static async deleteSupplier(id: string) {
    return SuppliersRepository.delete(id);
  }
}
