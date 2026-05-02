import bcrypt from "bcryptjs";
import { StoreListRepository } from "./storelist.repository.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";
import { buildSearchFilter } from "../../../utils/prisma.js";

export class StoreListService {
  static async getStores(filters: any, skip?: number, take?: number) {
    const { search, ...rest } = filters;
    const where = {
      ...rest,
      ...(search && {
        OR: [
          { storeName: { contains: search, mode: "insensitive" } },
          { owner: { mobile: { contains: search, mode: "insensitive" } } },
          { owner: { email: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };
    return StoreListRepository.findAll(where, skip, take);
  }

  static async getStoreById(id: string) {
    const store = await StoreListRepository.findById(id);
    if (!store) throw new ErrorHandler("Store not found", 404);
    return store;
  }

  static async createStore(data: any) {
    const loginEmail = data.loginEmail.trim().toLowerCase();
    const password = data.password.trim();
    const passwordHash = await bcrypt.hash(password, 12);

    const organizationData = {
      storeName: data.storeName.trim(),
      description: data.description,
      category: data.category,
      logo: data.logo,
      status: data.status || "ACTIVE",
      gstNo: data.gstNo,
      licenseNo: data.licenseNo,
      streetAddress: data.streetAddress,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,
      timezone: data.timezone,
      currency: data.currency,
      planId: data.planId,
    };

    return StoreListRepository.createStoreWithUser({
      user: {
        firstName: data.ownerFirstName.trim(),
        lastName: data.ownerLastName.trim(),
        email: loginEmail,
        passwordHash,
        mobile: data.ownerPhone.trim(),
      },
      organization: organizationData,
    });
  }

  static async updateStore(id: string, data: any) {
    await this.getStoreById(id);
    return StoreListRepository.updateStore(id, data);
  }

  static async deleteStore(id: string) {
    await this.getStoreById(id);
    return StoreListRepository.delete(id);
  }
}
