import ErrorHandler from "../../../utils/ErrorHandler.js";
import { StoreListRepository } from "./storelist.repository.js";
import { buildSearchFilter } from "../../../utils/prisma.js";

export class StoreListService {
    static async getAllStores(search?: string, skip?: number, take?: number) {
        const where = buildSearchFilter(search, ["storeName", "ownerEmail", "city"]);
        return StoreListRepository.findAll(where, skip, take);
    }

    static async getStoreById(id: string) {
        const store = await StoreListRepository.findById(id);
        if (!store) throw new ErrorHandler("Store not found", 404);
        return store;
    }

    static async createStore(data: any) {
        const existing = await StoreListRepository.findByStoreName(data.storeName);
        if (existing) throw new ErrorHandler("Store name already exists", 400);
        return StoreListRepository.create(data);
    }

    static async updateStore(id: string, data: any) {
        await this.getStoreById(id);
        return StoreListRepository.update(id, data);
    }

    static async deleteStore(id: string) {
        await this.getStoreById(id);
        return StoreListRepository.delete(id);
    }

    static async updateStoreStatus(id: string, isActive: boolean) {
        await this.getStoreById(id);
        return StoreListRepository.update(id, { status: isActive ? "ACTIVE" : "INACTIVE" });
    }
}
