import fs from "fs";
import os from "os";
import path from "path";
import { fromBuffer } from "pdf2pic";
import OpenAI from "openai";
import { rootPrisma } from "@/lib/prisma.js";
import { creditService } from "@/v1/modules/credit/credit.service.js";
import ErrorHandler from "@/utils/ErrorHandler.js";

export interface ParsedInvoiceItem {
  name: string;
  qty: number;
  freeQty?: number;
  batchNo?: string;
  expiry?: string;
  purchaseRate?: number;
  mrp?: number;
  discountPercent?: number;
  discount?: number;
  discountType?: string;
  cgst?: number;
  sgst?: number;
  hsn?: string;
}

export interface ParsedInvoice {
  invoiceNo?: string;
  invoiceDate?: string;
  items: ParsedInvoiceItem[];
}

export class LlmInvoiceParserService {
  /**
   * Parse a document using OpenAI GPT-4o.
   * Supports PDF, JPEG, PNG, TIFF, GIF.
   */
  static async parse(
    buffer: Buffer,
    mimeType: string,
    organizationId: string,
    branchId?: string | null,
  ): Promise<ParsedInvoice> {
    if (!organizationId) {
      throw new ErrorHandler("Organization ID is required for AI invoice parsing.", 400);
    }

    const org = await rootPrisma.organization.findUnique({
      where: { id: organizationId },
      select: { creditBalance: true },
    });

    if (!org) {
      throw new ErrorHandler("Organization not found.", 404);
    }

    if (org.creditBalance < 1) {
      throw new ErrorHandler("Insufficient credit balance. You need at least 1 credit to parse an invoice using AI.", 400);
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OpenAI configuration is missing. Please provide OPENAI_API_KEY in environment variables.",
      );
    }

    const openai = new OpenAI({ apiKey });
    const base64Images: string[] = [];

    if (mimeType === "application/pdf") {
      // Use pdf2pic to extract pages to base64 images
      try {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pdf2pic-"));
        const convert = fromBuffer(buffer, {
          density: 150,
          saveFilename: "invoice",
          savePath: tmpDir,
          format: "jpeg",
          width: 1024,
          height: 1024,
        });

        // Convert all pages. For very large PDFs this might take time.
        // In a production environment, you might limit this to the first 15 pages.
        const conversionResults = await convert.bulk(-1, {
          responseType: "base64",
        });

        for (const result of conversionResults) {
          if (result && result.base64) {
            base64Images.push(`data:image/jpeg;base64,${result.base64}`);
          }
        }

        // Clean up temp dir
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch (err: any) {
        throw new Error(`Failed to process PDF into images: ${err.message}`);
      }
    } else {
      // It's already an image
      const base64Str = buffer.toString("base64");
      base64Images.push(`data:${mimeType};base64,${base64Str}`);
    }

    if (base64Images.length === 0) {
      throw new Error("No images could be extracted from the provided file.");
    }

    // Limit to 20 pages max to avoid excessive token usage
    const pagesToProcess = base64Images.slice(0, 20);
    const pageCount = pagesToProcess.length;

    if (org.creditBalance < pageCount) {
      throw new ErrorHandler(
        `Insufficient credit balance. This document requires ${pageCount} credits (${pageCount} page${pageCount > 1 ? "s" : ""}), but your balance is ${org.creditBalance} credits.`,
        400
      );
    }

    const messages: any[] = [
      {
        role: "system",
        content:
          "You are an expert data extraction assistant. Your task is to extract invoice details from the provided images of an invoice or bill. Accurately capture the invoice number, date, and all line items. Output strictly in the requested JSON structure.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Please extract the invoice data from the following pages:",
          },
          ...pagesToProcess.map((base64Url) => ({
            type: "image_url",
            image_url: { url: base64Url, detail: "high" },
          })),
        ],
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-5.4-mini",
      messages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "invoice_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              invoiceNo: { type: "string" },
              invoiceDate: { type: "string" },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    qty: { type: "number" },
                    freeQty: { type: "number" },
                    batchNo: { type: "string" },
                    expiry: { type: "string", description: "Format: MM/YY" },
                    purchaseRate: {
                      type: "number",
                      description: "The unit purchase rate or cost price per item (e.g., 12.50, 150.00).",
                    },
                    mrp: {
                      type: "number",
                      description: "Maximum Retail Price (MRP) per item (e.g., 15.00, 200.00).",
                    },
                    discountPercent: { type: "number" },
                    discount: {
                      type: "number",
                      description: "The discount rate or amount extracted from the invoice (e.g. 10 for 10% or 50.00 for flat 50 Rs). Defaults to 0 if not present.",
                    },
                    discountType: {
                      type: "string",
                      description: "The type of the discount. Must be exactly 'percentage' or 'flat'. Defaults to 'flat' if no percentage sign is present.",
                    },
                    cgst: {
                      type: "number",
                      description: "CGST tax percentage rate (e.g., 2.5, 6, 9, 14). Extract the rate percentage, not the absolute currency tax amount.",
                    },
                    sgst: {
                      type: "number",
                      description: "SGST tax percentage rate (e.g., 2.5, 6, 9, 14). Extract the rate percentage, not the absolute currency tax amount.",
                    },
                    hsn: {
                      type: "string",
                      description: "HSN or SAC code of the product",
                    },
                  },
                  required: [
                    "name",
                    "qty",
                    "freeQty",
                    "batchNo",
                    "expiry",
                    "purchaseRate",
                    "mrp",
                    "discountPercent",
                    "discount",
                    "discountType",
                    "cgst",
                    "sgst",
                    "hsn",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["invoiceNo", "invoiceDate", "items"],
            additionalProperties: false,
          },
        },
      },
      max_completion_tokens: 4096,
      temperature: 0,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Failed to extract data from OpenAI.");
    }

    try {
      const parsedData: ParsedInvoice = JSON.parse(content);

      // Deduct credit only on successful extraction
      await creditService.deductCredit(
        organizationId,
        pageCount,
        `AI Invoice parsing (${pageCount} page${pageCount > 1 ? "s" : ""})`,
        branchId || undefined,
      );

      return parsedData;
    } catch (e: any) {
      throw new Error(
        "Failed to parse JSON response from OpenAI: " + e.message,
      );
    }
  }
}
