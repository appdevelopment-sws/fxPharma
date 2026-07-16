import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import * as xlsx from "xlsx";

export interface ParsedInvoiceItem {
  name: string;
  qty: number;
  freeQty?: number;
  batchNo?: string;
  expiry?: string; // MM/YY
  purchaseRate?: number;
  mrp?: number;
  discountPercent?: number;
  cgst?: number;
  sgst?: number;
}

export interface ParsedInvoice {
  invoiceNo?: string;
  invoiceDate?: string;
  items: ParsedInvoiceItem[];
}

function formatExpiryDate(val: string): string {
  if (!val) return "";
  const clean = val.replace(/[-/]/g, "/").trim();
  const parts = clean.split("/");
  if (parts.length === 2) {
    let month = parts[0].padStart(2, "0");
    let year = parts[1];
    if (year.length === 4) {
      year = year.slice(2);
    }
    return `${month}/${year}`;
  }
  return val;
}

export class InvoiceParserService {
  /**
   * Parse a document using Google Cloud Document AI.
   * Supports PDF, JPEG, PNG, TIFF, GIF.
   */
  static async parseDocumentAI(buffer: Buffer, mimeType: string): Promise<ParsedInvoice> {
    const projectId = process.env.DOCUMENT_AI_PROJECT_ID;
    const location = process.env.DOCUMENT_AI_LOCATION || "us";
    const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID;

    if (!projectId || !processorId) {
      throw new Error("Google Document AI configuration is missing in environment variables (.env). Please provide DOCUMENT_AI_PROJECT_ID and DOCUMENT_AI_PROCESSOR_ID.");
    }

    const clientOptions: any = {};
    if (location && location !== "us") {
      clientOptions.apiEndpoint = `${location}-documentai.googleapis.com`;
    }

    const client = new DocumentProcessorServiceClient(clientOptions);
    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    const request = {
      name,
      rawDocument: {
        content: buffer.toString("base64"),
        mimeType: mimeType,
      },
    };

    const [result] = await client.processDocument(request);
    const { document } = result;

    if (!document) {
      throw new Error("Failed to extract document data via Document AI.");
    }

    const entities = document.entities || [];
    let invoiceNo = "";
    let invoiceDate = "";
    const items: ParsedInvoiceItem[] = [];

    for (const entity of entities) {
      if (entity.type === "invoice_id") {
        invoiceNo = entity.mentionText || "";
      } else if (entity.type === "invoice_date") {
        invoiceDate = entity.mentionText || "";
      } else if (entity.type === "line_item") {
        let name = "";
        let qty = 0;
        let purchaseRate = 0;
        let amount = 0;
        let productCode = "";

        for (const prop of entity.properties || []) {
          if (prop.type === "line_item/description") {
            name = prop.mentionText || "";
          } else if (prop.type === "line_item/quantity") {
            const num = parseFloat(prop.normalizedValue?.text || prop.mentionText || "0");
            if (!isNaN(num)) qty = num;
          } else if (prop.type === "line_item/unit_price") {
            const num = parseFloat(prop.normalizedValue?.text || prop.mentionText || "0");
            if (!isNaN(num)) purchaseRate = num;
          } else if (prop.type === "line_item/amount") {
            const num = parseFloat(prop.normalizedValue?.text || prop.mentionText || "0");
            if (!isNaN(num)) amount = num;
          } else if (prop.type === "line_item/product_code") {
            productCode = prop.mentionText || "";
          }
        }

        if (name || productCode) {
          items.push({
            name: name || productCode,
            qty: qty || 1,
            freeQty: 0,
            batchNo: "",
            expiry: "",
            mrp: 0,
            purchaseRate: purchaseRate || (qty > 0 ? amount / qty : amount),
            discountPercent: 0,
            cgst: 0,
            sgst: 0,
          });
        }
      }
    }

    return {
      invoiceNo,
      invoiceDate,
      items,
    };
  }

  /**
   * Parse a digital Excel / CSV sheet using column mappings.
   */
  static parseExcel(buffer: Buffer): ParsedInvoice {
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
    const items: ParsedInvoiceItem[] = [];
    let invoiceNo = "";
    let invoiceDate = "";

    let headerRowIndex = -1;
    let headers: string[] = [];

    // Scan top 20 rows to detect headers and metadata
    for (let r = 0; r < Math.min(rows.length, 20); r++) {
      const row = rows[r];
      if (!Array.isArray(row)) continue;

      const cleanRow = row.map(cell => String(cell || "").toLowerCase().trim());
      const rowText = cleanRow.join(" ");

      if (!invoiceNo) {
        const invMatch = rowText.match(/(?:invoice\s*no|inv\s*no|bill\s*no)[:.\s]+([a-z0-9-/]+)/i);
        if (invMatch) invoiceNo = invMatch[1];
      }
      
      if (!invoiceDate) {
        const dateMatch = rowText.match(/(?:invoice\s*date|inv\s*date|bill\s*date|date)[:.\s]+(\d{2}[-/]\d{2}[-/]\d{2,4})/i);
        if (dateMatch) invoiceDate = dateMatch[1];
      }

      const hasProduct = cleanRow.some(h => h.includes("product") || h.includes("particular") || h.includes("item") || h.includes("medicine"));
      const hasBatch = cleanRow.some(h => h.includes("batch") || h.includes("b.no") || h.includes("bno"));
      const hasQty = cleanRow.some(h => h.includes("qty") || h.includes("quantity"));

      if (hasProduct && hasBatch && hasQty) {
        headerRowIndex = r;
        headers = cleanRow;
        break;
      }
    }

    // Fallback if no clean header row was found
    if (headerRowIndex === -1) {
      for (let r = 0; r < Math.min(rows.length, 10); r++) {
        const row = rows[r];
        if (Array.isArray(row) && row.length > 4) {
          headerRowIndex = r;
          headers = row.map(cell => String(cell || "").toLowerCase().trim());
          break;
        }
      }
    }

    if (headerRowIndex !== -1) {
      const colMap: Record<string, number> = {};
      headers.forEach((h, index) => {
        if (h.includes("product") || h.includes("particular") || h.includes("item") || h.includes("medicine") || h.includes("name")) {
          if (colMap["name"] === undefined) colMap["name"] = index;
        } else if (h.includes("batch") || h.includes("b.no") || h.includes("bno") || h.includes("batchno")) {
          colMap["batchNo"] = index;
        } else if (h.includes("exp") || h.includes("expiry")) {
          colMap["expiry"] = index;
        } else if (h.includes("qty") || h.includes("quantity") || h.includes("billed")) {
          if (!h.includes("free")) {
            colMap["qty"] = index;
          }
        } else if (h.includes("free") || h.includes("f.qty")) {
          colMap["freeQty"] = index;
        } else if (h.includes("rate") || h.includes("purchase") || h.includes("unit rate") || h.includes("pur rate") || h.includes("cost")) {
          colMap["purchaseRate"] = index;
        } else if (h.includes("mrp")) {
          colMap["mrp"] = index;
        } else if (h.includes("discount") || h.includes("disc") || h.includes("dis%") || h.includes("disc%")) {
          colMap["discountPercent"] = index;
        } else if (h.includes("gst") || h.includes("tax") || h.includes("cgst")) {
          colMap["gstPercent"] = index;
        }
      });

      // Parse items
      for (let r = headerRowIndex + 1; r < rows.length; r++) {
        const row = rows[r];
        if (!Array.isArray(row) || row.length === 0) continue;

        const productName = colMap["name"] !== undefined ? String(row[colMap["name"]] || "").trim() : "";
        if (!productName || productName.toLowerCase() === "total" || productName.toLowerCase() === "grand total") continue;

        const qty = colMap["qty"] !== undefined ? parseInt(row[colMap["qty"]]) || 0 : 0;
        if (qty === 0) continue;

        const freeQty = colMap["freeQty"] !== undefined ? parseInt(row[colMap["freeQty"]]) || 0 : 0;
        const batchNo = colMap["batchNo"] !== undefined ? String(row[colMap["batchNo"]] || "").trim() : "";
        const rawExpiry = colMap["expiry"] !== undefined ? String(row[colMap["expiry"]] || "").trim() : "";
        const expiry = rawExpiry ? formatExpiryDate(rawExpiry) : "";
        const mrp = colMap["mrp"] !== undefined ? parseFloat(row[colMap["mrp"]]) || 0 : 0;
        const purchaseRate = colMap["purchaseRate"] !== undefined ? parseFloat(row[colMap["purchaseRate"]]) || 0 : 0;
        const discountPercent = colMap["discountPercent"] !== undefined ? parseFloat(row[colMap["discountPercent"]]) || 0 : 0;
        const gstPercent = colMap["gstPercent"] !== undefined ? parseFloat(row[colMap["gstPercent"]]) || 0 : 0;

        const cgst = gstPercent / 2;
        const sgst = gstPercent / 2;

        items.push({
          name: productName,
          qty,
          freeQty,
          batchNo,
          expiry,
          mrp,
          purchaseRate,
          discountPercent,
          cgst,
          sgst,
        });
      }
    }

    return {
      invoiceNo,
      invoiceDate,
      items,
    };
  }
}
