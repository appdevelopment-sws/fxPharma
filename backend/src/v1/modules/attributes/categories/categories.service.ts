import ErrorHandler from "../../../../utils/ErrorHandler.js";
import { CategoriesRepository } from "./categories.repository.js";
import { buildSearchFilter } from "../../../../utils/prisma.js";

export class CategoriesService {
  static async getAllCategories(search?: string, skip?: number, take?: number) {
    const where = buildSearchFilter(search, ["name", "description"]);
    return CategoriesRepository.findAll(where, skip, take);
  }

  static async getCategoryById(id: string) {
    const category = await CategoriesRepository.findById(id);
    if (!category) throw new ErrorHandler("Category not found", 404);
    return category;
  }

  static async createCategory(data: any) {
    const existing = await CategoriesRepository.findByName(data.name);
    if (existing) throw new ErrorHandler("Category name already exists", 400);
    return CategoriesRepository.create(data);
  }

  static async updateCategory(id: string, data: any) {
    await this.getCategoryById(id);
    return CategoriesRepository.update(id, data);
  }

  static async deleteCategory(id: string) {
    const category = await this.getCategoryById(id);
    if (category.children && category.children.length > 0) {
      throw new ErrorHandler("Cannot delete category because it has sub-categories", 400);
    }
    return CategoriesRepository.delete(id);
  }

  static async updateCategoryStatus(id: string, isActive: boolean) {
    await this.getCategoryById(id);
    return CategoriesRepository.update(id, { isActive });
  }
}
