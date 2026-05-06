import { OrdersRepository } from "./orders.repository.js";

export class OrdersService {
  static async getAllOrders(search?: string, skip?: number, take?: number) {
    const filters: any = {};
    if (search) {
      filters.OR = [
        {
          supplier: { companyName: { contains: search, mode: "insensitive" } },
        },
        { status: { contains: search, mode: "insensitive" } },
      ];
    }
    return OrdersRepository.findAll(filters, skip, take);
  }

  static async getOrderById(id: string) {
    return OrdersRepository.findById(id);
  }

  static async createOrder(data: any) {
    return OrdersRepository.create(data);
  }

  static async updateOrder(id: string, data: any) {
    return OrdersRepository.update(id, data);
  }

  static async deleteOrder(id: string) {
    return OrdersRepository.delete(id);
  }
}
