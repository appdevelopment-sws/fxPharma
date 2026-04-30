import ErrorHandler from "../../../utils/ErrorHandler.js";
import { FeaturesRepository } from "./features.repository.js";
import { buildSearchFilter } from "../../../utils/prisma.js";

export class FeaturesService {
  static async getAllFeatures(search?: string, skip?: number, take?: number) {
    const where = buildSearchFilter(search);
    return FeaturesRepository.findAll(where, skip, take);
  }

  static async getFeatureById(id: string) {
    const feature = await FeaturesRepository.findById(id);
    if (!feature) throw new ErrorHandler("Feature not found", 404);
    return feature;
  }

  static async createFeature(data: any) {
    const existing = await FeaturesRepository.findByKey(data.key);
    if (existing) throw new ErrorHandler("Feature key already exists", 400);
    return FeaturesRepository.create(data);
  }

  static async updateFeature(id: string, data: any) {
    await this.getFeatureById(id);
    return FeaturesRepository.update(id, data);
  }

  static async deleteFeature(id: string) {
    await this.getFeatureById(id);
    return FeaturesRepository.delete(id);
  }
}
