import { NewCompoundRepository } from "./new_compound.repository.js";

export class NewCompoundService {
  static async getAllCompounds(search?: string, skip?: number, take?: number) {
    const filters: any = {};
    if (search) {
      filters.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { dosageForm: { contains: search, mode: "insensitive" } },
      ];
    }
    return NewCompoundRepository.findAll(filters, skip, take);
  }

  static async getCompoundById(id: string) {
    return NewCompoundRepository.findById(id);
  }

  static async createCompound(data: any) {
    return NewCompoundRepository.create(data);
  }

  static async updateCompound(id: string, data: any) {
    return NewCompoundRepository.update(id, data);
  }

  static async deleteCompound(id: string) {
    return NewCompoundRepository.delete(id);
  }
}
