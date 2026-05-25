import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import ErrorHandler from "../../../utils/ErrorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_DIR = path.resolve(__dirname, "../../../templates/invoices");
const DEFAULT_TEMPLATE_NAME = "template1";

type InvoiceTemplateValue = string | number | null | undefined;

type InvoiceLike = {
  invoiceId: string;
  customerName: string | null;
  customerPhone: string | null;
  paymentMode: string;
  status: string;
  grossAmount: unknown;
  discountAmount: unknown;
  taxAmount: unknown;
  deliveryCost: unknown;
  totalAmount: unknown;
  tenderedAmount: unknown;
  changeAmount: unknown;
  notes: string | null;
  createdAt: Date;
  items: Array<{
    inventoryName: string;
    batchNo: string | null;
    qty: number;
    sellUnit: string;
    rateValue: unknown;
    itemDiscount: unknown;
    subTotal: unknown;
  }>;
};

function escapeHtml(value: InvoiceTemplateValue) {
  const input = String(value ?? "");
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatCurrency(value: unknown) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDateTime(value: Date | string | number) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toTitleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function mapPaymentMode(value: string) {
  switch (value) {
    case "UPI":
      return "UPI";
    case "CARD":
      return "Card";
    case "CASH":
      return "Cash";
    default:
      return toTitleCase(value || "Unknown");
  }
}

function sanitizeTemplateName(templateName?: string | null) {
  const raw = (templateName || DEFAULT_TEMPLATE_NAME).trim();
  const withoutExtension = path.basename(raw).replace(/\.hbs$/i, "");

  if (!/^[a-zA-Z0-9_-]+$/.test(withoutExtension)) {
    throw new ErrorHandler("Invalid invoice template name.", 400);
  }

  return withoutExtension;
}

async function listTemplateNames() {
  try {
    const entries = await fs.readdir(TEMPLATE_DIR);
    return entries
      .filter((entry) => entry.toLowerCase().endsWith(".hbs"))
      .map((entry) => path.basename(entry, ".hbs"))
      .sort((left, right) => left.localeCompare(right));
  } catch {
    return [];
  }
}

async function resolveTemplatePath(templateName?: string | null) {
  const safeTemplateName = sanitizeTemplateName(templateName);
  const templatePath = path.join(TEMPLATE_DIR, `${safeTemplateName}.hbs`);

  try {
    await fs.access(templatePath);
    return { templatePath, safeTemplateName };
  } catch {
    const availableTemplates = await listTemplateNames();
    const fallbackPath = path.join(
      TEMPLATE_DIR,
      `${DEFAULT_TEMPLATE_NAME}.hbs`,
    );

    if (safeTemplateName !== DEFAULT_TEMPLATE_NAME) {
      throw new ErrorHandler(
        `Invoice template "${safeTemplateName}" was not found. Available templates: ${
          availableTemplates.length > 0 ? availableTemplates.join(", ") : "none"
        }`,
        404,
      );
    }

    try {
      await fs.access(fallbackPath);
      return {
        templatePath: fallbackPath,
        safeTemplateName: DEFAULT_TEMPLATE_NAME,
      };
    } catch {
      throw new ErrorHandler(
        `Default invoice template was not found. Available templates: ${
          availableTemplates.length > 0 ? availableTemplates.join(", ") : "none"
        }`,
        500,
      );
    }
  }
}

function renderTemplate(template: string, data: Record<string, string>) {
  let output = template;

  for (const [key, value] of Object.entries(data)) {
    const rawPattern = new RegExp(String.raw`{{{\s*${key}\s*}}}`, "g");
    const escapedPattern = new RegExp(String.raw`{{\s*${key}\s*}}`, "g");
    output = output.replace(rawPattern, value);
    output = output.replace(escapedPattern, escapeHtml(value));
  }

  return output;
}

function buildItemRows(invoice: InvoiceLike) {
  return invoice.items
    .map((item, index) => {
      return `
        <tr>
          <td class="cell cell-center">${index + 1}</td>
          <td class="cell">
            <div class="item-title">${escapeHtml(item.inventoryName)}</div>
            <div class="item-meta">
              ${item.batchNo ? `<span>Batch: ${escapeHtml(item.batchNo)}</span>` : ""}
              <span>Unit: ${escapeHtml(item.sellUnit || "-")}</span>
            </div>
          </td>
          <td class="cell cell-center">${item.qty}</td>
          <td class="cell cell-right">${escapeHtml(formatCurrency(item.rateValue))}</td>
          <td class="cell cell-right">${escapeHtml(formatCurrency(item.itemDiscount))}</td>
          <td class="cell cell-right">${escapeHtml(formatCurrency(item.subTotal))}</td>
        </tr>
      `;
    })
    .join("");
}

function buildSummaryRows(invoice: InvoiceLike) {
  const rows = [
    ["Gross Amount", formatCurrency(invoice.grossAmount)],
    ["Discount", formatCurrency(invoice.discountAmount)],
    ["Tax", formatCurrency(invoice.taxAmount)],
    ["Delivery", formatCurrency(invoice.deliveryCost)],
    ["Total Amount", formatCurrency(invoice.totalAmount)],
    ["Tendered", formatCurrency(invoice.tenderedAmount)],
    ["Change", formatCurrency(invoice.changeAmount)],
  ];

  return rows
    .map(
      ([label, value]) => `
        <tr>
          <td>${escapeHtml(label)}</td>
          <td class="cell-right">${escapeHtml(value)}</td>
        </tr>
      `,
    )
    .join("");
}

function buildInvoiceData(invoice: InvoiceLike, templateName?: string | null) {
  const safeTemplateName = sanitizeTemplateName(templateName);
  const createdAt = formatDateTime(invoice.createdAt);
  const customerName = invoice.customerName?.trim() || "Walk-in Customer";
  const customerPhone = invoice.customerPhone?.trim() || "-";
  const notes = invoice.notes?.trim() || "";
  const items = invoice.items || [];

  return {
    safeTemplateName,
    brandName: process.env.INVOICE_COMPANY_NAME || "Dawa Dukaan",
    brandTagline:
      process.env.INVOICE_COMPANY_TAGLINE ||
      "Simple, reusable invoice templates",
    brandAddress: process.env.INVOICE_COMPANY_ADDRESS || "India",
    brandPhone: process.env.INVOICE_COMPANY_PHONE || "",
    brandEmail: process.env.INVOICE_COMPANY_EMAIL || "",
    brandGstin: process.env.INVOICE_COMPANY_GSTIN || "",
    invoiceId: invoice.invoiceId,
    invoiceStatus: toTitleCase(invoice.status),
    paymentMode: mapPaymentMode(invoice.paymentMode),
    createdAt,
    customerName,
    customerPhone,
    itemCount: String(items.length),
    grossAmount: formatCurrency(invoice.grossAmount),
    discountAmount: formatCurrency(invoice.discountAmount),
    taxAmount: formatCurrency(invoice.taxAmount),
    deliveryCost: formatCurrency(invoice.deliveryCost),
    totalAmount: formatCurrency(invoice.totalAmount),
    tenderedAmount: formatCurrency(invoice.tenderedAmount),
    changeAmount: formatCurrency(invoice.changeAmount),
    itemsRows: buildItemRows(invoice),
    summaryRows: buildSummaryRows(invoice),
    notesBlock: notes
      ? `
        <div class="notes">
          <div class="notes-label">Notes</div>
          <div class="notes-value">${escapeHtml(notes)}</div>
        </div>
      `
      : "",
    notesValue: notes || "-",
    companyContactBlock: [
      process.env.INVOICE_COMPANY_PHONE,
      process.env.INVOICE_COMPANY_EMAIL,
    ]
      .filter(Boolean)
      .join(" · "),
  };
}

class InvoiceTemplateService {
  getSafeTemplateName(templateName?: string | null) {
    return sanitizeTemplateName(templateName);
  }

  async getAvailableTemplates() {
    return listTemplateNames();
  }

  async renderInvoiceHtml(invoice: InvoiceLike, templateName?: string | null) {
    const { templatePath, safeTemplateName } =
      await resolveTemplatePath(templateName);
    const template = await fs.readFile(templatePath, "utf8");
    const data = buildInvoiceData(invoice, safeTemplateName);

    return renderTemplate(template, data);
  }

  async renderInvoicePdf(invoice: InvoiceLike, templateName?: string | null) {
    const html = await this.renderInvoiceHtml(invoice, templateName);
    let browser;
    if (process.env.NODE_ENV == "development") {
      console.log("her=>", process.env.NODE_ENV);
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } else {
      console.log("her=>>>>>>>>>>>", process.env.NODE_ENV);

      browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "load" });
      await page.emulateMediaType("screen");

      return await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "0",
          right: "0",
          bottom: "0",
          left: "0",
        },
      });
    } finally {
      await browser.close();
    }
  }
}

export const invoiceTemplateService = new InvoiceTemplateService();
