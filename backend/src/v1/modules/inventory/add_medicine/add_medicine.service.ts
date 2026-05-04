import { InventoryRepository } from "./add_medicine.repository.js";

export class InventoryService {
  static async getAllInventory(search?: string, skip?: number, take?: number) {
    const filters: any = {};
    if (search) {
      filters.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { manufacturer: { contains: search, mode: "insensitive" } },
        { saltComposition: { contains: search, mode: "insensitive" } },
      ];
    }
    return InventoryRepository.findAll(filters, skip, take);
  }

  static async getInventoryById(id: string) {
    return InventoryRepository.findById(id);
  }

  static async createInventory(data: any) {
    return InventoryRepository.create(data);
  }

  static async updateInventory(id: string, data: any) {
    return InventoryRepository.update(id, data);
  }

  static async deleteInventory(id: string) {
    return InventoryRepository.delete(id);
  }
}
