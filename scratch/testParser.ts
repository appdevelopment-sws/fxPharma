import { InvoiceParserService } from "../backend/src/v1/modules/orders/invoiceParser.service.js";

// Mock text representing a digital PDF parse result from a standard invoice format
const mockPdfText = `
TAX INVOICE
Invoice No: KHU2631
Invoice Date: 04/10/2023
KHUSHBOO AGENCY
ANAND NAGAR, NEAR BELORI CINEMA HALL, PURNEA

S. Qty. PRODUCT HSN MFG BATCH Exp MRP RATE NET DIS% GST% Amount
1 5 29+1 ALBOMAR 30ML 30049085 ALBO AE94719 7/26 39.50 28.21 29.32 4.00 12.00 136.35
2 1 BROTONE VET 1LT 30049085 ALBO GG584 5/25 64.50 46.07 47.88 4.00 12.00 46.07
8 5+1 TETRA BOLUS BST 30049085 TETR STT-305 6/25 365.00 261.71 252.95 4.00 12.00 239.91
10 1 LIVLI -101 LT 2309 LIVL 0342223 10/25 310.00 217.00 208.32 4.00 12.00 217.00
GRAND TOTAL 5975.00
`;

async function testPdfParsing() {
  console.log("=== Testing PDF Parser ===");
  // Simulate pdf-parse behavior by mock resolving
  // We can override the pdf-parse dependency inside parser service for testing,
  // or we can test the token parser logic by mocking the pdf function.
  // Let's call the parser's parsePDF logic with a mock buffer.
  // To test this easily, we can write a test in pure JS/TS.
  
  // Let's directly feed the mock lines to our regex/token logic to see if it parses correctly!
  const lines = mockPdfText.split("\n");
  const items = [];
  let invoiceNo = "";
  let invoiceDate = "";

  for (const line of lines) {
    const cleanLine = line.trim();
    if (!invoiceNo) {
      const invMatch = cleanLine.match(/(?:Invoice\s*No|Inv\s*No|Bill\s*No)[:.\s]+([A-Za-z0-9-/]+)/i);
      if (invMatch) invoiceNo = invMatch[1];
    }
    if (!invoiceDate) {
      const dateMatch = cleanLine.match(/(?:Invoice\s*Date|Inv\s*Date|Bill\s*Date|Date)[:.\s]+(\d{2}[-/]\d{2}[-/]\d{2,4})/i);
      if (dateMatch) invoiceDate = dateMatch[1];
    }
  }

  console.log(`Extracted Invoice No: ${invoiceNo}`);
  console.log(`Extracted Invoice Date: ${invoiceDate}`);

  for (const line of lines) {
    const cleanLine = line.trim();
    const tokens = cleanLine.split(/\s+/);
    if (tokens.length < 8) continue;

    let expiryIndex = -1;
    for (let i = tokens.length - 3; i >= 2; i--) {
      if (/^\d{1,2}[-/]\d{2,4}$/.test(tokens[i])) {
        expiryIndex = i;
        break;
      }
    }

    if (expiryIndex === -1) continue;

    const rightTokens = tokens.slice(expiryIndex + 1);
    const numericRightTokens = rightTokens.map(t => {
      const cleaned = t.replace("%", "");
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    });

    const mrp = numericRightTokens[0] || 0;
    const rate = numericRightTokens[1] || 0;
    let discountPercent = 0;
    let gstPercent = 0;

    if (numericRightTokens.length >= 5) {
      discountPercent = numericRightTokens[3];
      gstPercent = numericRightTokens[4];
    } else if (numericRightTokens.length === 4) {
      discountPercent = numericRightTokens[2];
      gstPercent = numericRightTokens[3];
    }

    const batchNo = tokens[expiryIndex - 1];
    const sNo = parseInt(tokens[0]);
    if (isNaN(sNo)) continue;

    let qty = 0;
    let freeQty = 0;
    let productNameStartIndex = 1;

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

    let productNameEndIndex = expiryIndex - 1;
    if (expiryIndex - 2 >= productNameStartIndex) {
      if (/^\d{4,8}$/.test(tokens[expiryIndex - 3])) {
        productNameEndIndex = expiryIndex - 3;
      } else if (/^\d{4,8}$/.test(tokens[expiryIndex - 2])) {
        productNameEndIndex = expiryIndex - 2;
      } else {
        const possibleMfg = tokens[expiryIndex - 2];
        if (/^[A-Z]{3,8}$/.test(possibleMfg)) {
          productNameEndIndex = expiryIndex - 2;
        }
      }
    }

    const productName = tokens.slice(productNameStartIndex, productNameEndIndex).join(" ");
    
    items.push({
      name: productName,
      qty,
      freeQty,
      batchNo,
      expiry: tokens[expiryIndex],
      mrp,
      purchaseRate: rate,
      discountPercent,
      gstPercent
    });
  }

  console.log("Parsed Items:");
  console.log(JSON.stringify(items, null, 2));
}

testPdfParsing();
