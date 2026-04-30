import { Request, Response, NextFunction } from "express";
import * as taxHsnService from "./taxhsn.service.js";

/**
 * --- Tax Controllers ---
 */

export const createTax = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tax = await taxHsnService.createTax(req.body);
    res.status(201).json({
      success: true,
      data: tax,
      message: "Tax rule created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getTaxes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taxes = await taxHsnService.getAllTaxes();
    res.status(200).json({
      success: true,
      data: taxes,
    });
  } catch (error) {
    next(error);
  }
};

export const getTax = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tax = await taxHsnService.getTaxById(id);
    if (!tax) {
      return res.status(404).json({
        success: false,
        message: "Tax not found",
      });
    }
    res.status(200).json({
      success: true,
      data: tax,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTax = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tax = await taxHsnService.updateTax(id, req.body);
    res.status(200).json({
      success: true,
      data: tax,
      message: "Tax rule updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTax = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await taxHsnService.deleteTax(id);
    res.status(200).json({
      success: true,
      message: "Tax rule deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * --- HSN Controllers ---
 */

export const createHSN = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hsn = await taxHsnService.createHSN(req.body);
    res.status(201).json({
      success: true,
      data: hsn,
      message: "HSN code created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getHSNs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hsns = await taxHsnService.getAllHSNs();
    res.status(200).json({
      success: true,
      data: hsns,
    });
  } catch (error) {
    next(error);
  }
};

export const getHSN = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const hsn = await taxHsnService.getHSNById(id);
    if (!hsn) {
      return res.status(404).json({
        success: false,
        message: "HSN not found",
      });
    }
    res.status(200).json({
      success: true,
      data: hsn,
    });
  } catch (error) {
    next(error);
  }
};

export const updateHSN = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const hsn = await taxHsnService.updateHSN(id, req.body);
    res.status(200).json({
      success: true,
      data: hsn,
      message: "HSN code updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHSN = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await taxHsnService.deleteHSN(id);
    res.status(200).json({
      success: true,
      message: "HSN code deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
