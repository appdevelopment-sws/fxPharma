import ErrorHandler from "../../../utils/ErrorHandler.js";
import { PlansRepository } from "./plans.repository.js";

export class PlansService {
  static async getAllPlans(status?: number, skip?: number, take?: number) {
    const filters: any = {};
    if (status !== undefined) filters.status = status;
    return PlansRepository.findAll(filters, skip, take);
  }

  static async getPlanById(id: string) {
    const plan = await PlansRepository.findById(id);
    if (!plan) throw new ErrorHandler("Plan not found", 404);
    return plan;
  }

  static async createPlan(data: any) {
    const { featureIds, ...planData } = data;

    // Check if key already exists
    const existing = await PlansRepository.findByKey(planData.key);
    if (existing) throw new ErrorHandler("Plan key already exists", 400);

    return PlansRepository.create(planData, featureIds);
  }

  static async updatePlan(id: string, data: any) {
    const { featureIds, ...planData } = data;

    // Check if plan exists
    await this.getPlanById(id);

    return PlansRepository.update(id, planData, featureIds);
  }

  static async deletePlan(id: string) {
    await this.getPlanById(id);
    return PlansRepository.delete(id);
  }

  static async updatePlanStatus(id: string, status: number) {
    await this.getPlanById(id);
    return PlansRepository.update(id, { status });
  }
}
