import { MasterProductRepository } from "./masterProduct.repository.js";

export class MasterProductService {
  static async getAllProducts(
    search: string = "",
    skip: number = 0,
    take: number = 10,
    status?: string,
  ) {
    return MasterProductRepository.getAll(search, skip, take, status);
  }

  static async getProductById(id: string) {
    return MasterProductRepository.getById(id);
  }

  static async createProduct(data: any) {
    return MasterProductRepository.create(data);
  }

  static async updateProduct(id: string, data: any) {
    return MasterProductRepository.update(id, data);
  }

  static async deleteProduct(id: string) {
    return MasterProductRepository.delete(id);
  }
}
