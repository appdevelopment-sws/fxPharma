import { PDFParse } from "pdf-parse";
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
   * Parse a digital PDF file buffer using pattern-based token matching.
   */
  static async parsePDF(buffer: Buffer): Promise<ParsedInvoice> {
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    const text = data.text;
    const lines = text.split("\n");
    const items: ParsedInvoiceItem[] = [];
    let invoiceNo = "";
    let invoiceDate = "";

    // Extract invoice number and date from text headers if available
    for (const line of lines) {
      const cleanLine = line.trim();
      
      if (!invoiceNo) {
        const invMatch = cleanLine.match(/(?:Invoice\s*No|Inv\s*No|Bill\s*No)[:.\s]+([A-Za-z0-9-/]+)/i);
        if (invMatch) {
          invoiceNo = invMatch[1];
        }
      }
      
      if (!invoiceDate) {
        const dateMatch = cleanLine.match(/(?:Invoice\s*Date|Inv\s*Date|Bill\s*Date|Date)[:.\s]+(\d{2}[-/]\d{2}[-/]\d{2,4})/i);
        if (dateMatch) {
          invoiceDate = dateMatch[1];
        }
      }
    }

    for (const line of lines) {
      const cleanLine = line.trim();
      const tokens = cleanLine.split(/\s+/);
      if (tokens.length < 8) continue; // Minimum length to contain all required items

      // Locate the expiry date token (format: MM/YY or MM-YY or MM/YYYY)
      let expiryIndex = -1;
      for (let i = tokens.length - 3; i >= 2; i--) {
        if (/^\d{1,2}[-/]\d{2,4}$/.test(tokens[i])) {
          expiryIndex = i;
          break;
        }
      }

      if (expiryIndex === -1) continue;

      // Extract numeric values to the right of Expiry (MRP, Rate, Net, Disc%, GST%, Amount)
      const rightTokens = tokens.slice(expiryIndex + 1);
      const numericRightTokens = rightTokens.map((t: string) => {
        const cleaned = t.replace("%", "");
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
      });

      const mrp = numericRightTokens[0] || 0;
      const rate = numericRightTokens[1] || 0;
      
      const length = numericRightTokens.length;
      let discountPercent = 0;
      let gstPercent = 0;

      if (length === 6) {
        // MRP, Rate, Net, Disc%, GST%, Amount
        discountPercent = numericRightTokens[3];
        gstPercent = numericRightTokens[4];
      } else if (length === 5) {
        // MRP, Rate, Disc%, GST%, Amount
        discountPercent = numericRightTokens[2];
        gstPercent = numericRightTokens[3];
      } else if (length === 4) {
        // MRP, Rate, GST%, Amount
        discountPercent = 0;
        gstPercent = numericRightTokens[2];
      }

      // Batch is the token right before Expiry
      const batchNo = tokens[expiryIndex - 1];

      // S.No is the first token
      const sNo = parseInt(tokens[0]);
      if (isNaN(sNo)) continue;

      // Parse quantity: tokens[1] (Qty)
      let qty = 0;
      let freeQty = 0;
      let productNameStartIndex = 1;

      // Quantity parser for formats like "5 29+1" or "5+1" or "10"
      if (/^\d+\+\d+$/.test(tokens[1])) {
        const parts = tokens[1].split("+");
        qty = parseInt(parts[0]) || 0;
        freeQty = parseInt(parts[1]) || 0;
        productNameStartIndex = 2;
      } else if (/^\d+$/.test(tokens[1]) && /^\d+\+\d+$/.test(tokens[2])) {
        const parts = tokens[2].split("+");
        qty = parseInt(tokens[1]) + (parseInt(parts[0]) || 0);
        freeQty = parseInt(parts[1]) || 0;
        productNameStartIndex = 3;
      } else if (/^\d+$/.test(tokens[1])) {
        qty = parseInt(tokens[1]);
        productNameStartIndex = 2;
      }

      // Determine product name bounds
      let productNameEndIndex = expiryIndex - 1; // Default to right before Batch

      // Skip MFG code and HSN code if they are present before Batch
      if (expiryIndex - 2 >= productNameStartIndex) {
        // HSN is usually 4-8 digits
        if (/^\d{4,8}$/.test(tokens[expiryIndex - 3])) {
          productNameEndIndex = expiryIndex - 3;
        } else if (/^\d{4,8}$/.test(tokens[expiryIndex - 2])) {
          productNameEndIndex = expiryIndex - 2;
        } else {
          // If the word before batch is MFG (short uppercase word, e.g. ALBO, MANKIND)
          const possibleMfg = tokens[expiryIndex - 2];
          if (/^[A-Z]{3,8}$/.test(possibleMfg)) {
            productNameEndIndex = expiryIndex - 2;
          }
        }
      }

      const productName = tokens.slice(productNameStartIndex, productNameEndIndex).join(" ");
      const cgst = gstPercent / 2;
      const sgst = gstPercent / 2;

      items.push({
        name: productName,
        qty,
        freeQty,
        batchNo,
        expiry: formatExpiryDate(tokens[expiryIndex]),
        mrp,
        purchaseRate: rate,
        discountPercent,
        cgst,
        sgst,
      });
    }

    // Fallback: If no items were parsed using the standard layout, try generic layout parsing
    if (items.length === 0) {
      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine) continue;

        // Skip headers or common non-item lines
        if (
          cleanLine.toLowerCase().includes("invoice") ||
          cleanLine.toLowerCase().includes("tax invoice") ||
          cleanLine.toLowerCase().includes("grand total") ||
          cleanLine.toLowerCase().includes("sub total") ||
          cleanLine.toLowerCase().includes("gst") ||
          cleanLine.toLowerCase().includes("note:")
        ) {
          continue;
        }

        const tokens = cleanLine.split(/\s+/);
        if (tokens.length < 3) continue;

        // Count numeric values at the end of tokens
        let numericCount = 0;
        const numValues: number[] = [];

        for (let i = tokens.length - 1; i >= 0; i--) {
          const token = tokens[i];
          // Check if token is a pure number (no letters like ML, GM, KG, etc.)
          if (/^[+-]?\d+(?:\.\d+)?%?$/.test(token) || /^[+-]?\d+(?:\.\d+)?$/.test(token)) {
            const val = parseFloat(token.replace("%", ""));
            numericCount++;
            numValues.unshift(val);
          } else {
            break;
          }
        }

        if (numericCount < 2) continue;

        const productNameTokens = tokens.slice(0, tokens.length - numericCount);
        // Remove leading serial number if present
        if (productNameTokens.length > 1 && /^\d+$/.test(productNameTokens[0])) {
          productNameTokens.shift();
        }

        const productName = productNameTokens.join(" ").trim();
        if (
          !productName ||
          productName.toLowerCase() === "total" ||
          productName.toLowerCase() === "subtotal" ||
          productName.toLowerCase() === "product" ||
          productName.toLowerCase() === "qty" ||
          productName.toLowerCase() === "particulars"
        ) {
          continue;
        }

        let qty = 1;
        let freeQty = 0;
        let mrp = 0;
        let purchaseRate = 0;
        let discountPercent = 0;
        let gstPercent = 0;

        if (numericCount === 2) {
          qty = numValues[0];
          purchaseRate = qty > 0 ? numValues[1] / qty : numValues[1];
        } else if (numericCount === 3) {
          qty = numValues[0];
          mrp = numValues[1];
          purchaseRate = qty > 0 ? numValues[2] / qty : numValues[2];
        } else if (numericCount === 4) {
          qty = numValues[0];
          mrp = numValues[1];
          gstPercent = numValues[2];
          purchaseRate = qty > 0 ? numValues[3] / qty : numValues[3];
        } else if (numericCount === 5) {
          qty = numValues[0];
          mrp = numValues[1];
          purchaseRate = numValues[2];
          gstPercent = numValues[3];
        } else if (numericCount === 6) {
          qty = numValues[0];
          mrp = numValues[1];
          purchaseRate = numValues[2];
          discountPercent = numValues[3];
          gstPercent = numValues[4];
        } else if (numericCount >= 7) {
          qty = numValues[0];
          freeQty = numValues[1];
          mrp = numValues[2];
          purchaseRate = numValues[3];
          discountPercent = numValues[4];
          gstPercent = numValues[5];
        }

        const cgst = gstPercent / 2;
        const sgst = gstPercent / 2;

        items.push({
          name: productName,
          qty,
          freeQty,
          batchNo: "",
          expiry: "",
          mrp,
          purchaseRate: Math.round(purchaseRate * 100) / 100,
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
