import { Request, Response } from "express";
import * as masterProductService from "./masterProduct.service.js";
import {
  createMasterProductSchema,
  listMasterProductsQuerySchema,
  productIdParamSchema,
  updateMasterProductSchema,
} from "./masterProduct.validation.js";

export const listProducts = async (req: Request, res: Response) => {
  try {
    const query = listMasterProductsQuerySchema.parse(req.query);
    const data = await masterProductService.listProducts(query);

    res.status(200).json({
      success: true,
      data,
      message: "Master products retrieved successfully",
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message ?? "Failed to retrieve master products",
    });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = productIdParamSchema.parse(req.params);
    const data = await masterProductService.getProductById(id);

    res.status(200).json({
      success: true,
      data,
      message: "Master product retrieved successfully",
    });
  } catch (error: any) {
    console.error(error);
    res.status(404).json({
      success: false,
      message: error.message ?? "Master product not found",
    });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const payload = createMasterProductSchema.parse(req.body);
    const data = await masterProductService.createProduct(payload);

    res.status(201).json({
      success: true,
      data,
      message: "Master product created successfully",
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message ?? "Failed to create master product",
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = productIdParamSchema.parse(req.params);
    const payload = updateMasterProductSchema.parse(req.body);
    const data = await masterProductService.updateProduct(id, payload);

    res.status(200).json({
      success: true,
      data,
      message: "Master product updated successfully",
    });
  } catch (error: any) {
    console.error(error);
    const statusCode =
      error.message === "Master product not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message ?? "Failed to update master product",
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = productIdParamSchema.parse(req.params);
    await masterProductService.deleteProduct(id);

    res.status(200).json({
      success: true,
      message: "Master product deleted successfully",
    });
  } catch (error: any) {
    console.error(error);
    const statusCode =
      error.message === "Master product not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message ?? "Failed to delete master product",
    });
  }
};
