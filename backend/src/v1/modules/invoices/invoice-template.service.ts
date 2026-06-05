import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import ErrorHandler from "../../../utils/ErrorHandler.js";
import { rootPrisma } from "@/lib/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_DIR = path.resolve(__dirname, "../../../templates/invoices");
const DEFAULT_TEMPLATE_NAME = "template1";

type InvoiceTemplateValue = string | number | null | undefined;

type InvoiceLike = {
  invoiceId: string;
  organizationId: string;
  branchId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  paymentMode: string;
  cashAmount?: unknown;
  onlineAmount?: unknown;
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

function buildInvoiceData(
  invoice: InvoiceLike,
  templateName?: string | null,
  settingsMap: Record<string, string> = {},
) {
  const toBoolean = (value?: string | null) => {
    if (value == null) return true;
    return !["false", "0", "off", "no"].includes(String(value).toLowerCase());
  };
  const safeTemplateName = sanitizeTemplateName(templateName);
  const createdAt = formatDateTime(invoice.createdAt);
  const customerName = invoice.customerName?.trim() || "Walk-in Customer";
  const customerPhone = invoice.customerPhone?.trim() || "-";
  const notes = invoice.notes?.trim() || "";
  const items = invoice.items || [];

  let displayPaymentMode = mapPaymentMode(invoice.paymentMode);
  if (invoice.paymentMode === "SPLIT") {
    const cashStr = formatCurrency(invoice.cashAmount ?? 0);
    const onlineStr = formatCurrency(invoice.onlineAmount ?? 0);
    displayPaymentMode = `Split (Cash: ${cashStr}, Online: ${onlineStr})`;
  }

  const brandName =
    settingsMap["store_name"] ||
    settingsMap["invoice_company_name"] ||
    process.env.INVOICE_COMPANY_NAME ||
    "Dawa Dukaan";
  const brandTagline =
    settingsMap["description"] ||
    settingsMap["invoice_company_tagline"] ||
    process.env.INVOICE_COMPANY_TAGLINE ||
    "Simple, reusable invoice templates";

  // Construct address from parts if available, otherwise fallback
  const addressParts = [
    settingsMap["street_address"],
    settingsMap["city"],
    settingsMap["state"],
    settingsMap["zip_code"],
    settingsMap["country"],
  ].filter(Boolean);
  const brandAddress =
    addressParts.length > 0
      ? addressParts.join(", ")
      : settingsMap["invoice_company_address"] ||
        process.env.INVOICE_COMPANY_ADDRESS ||
        "India";

  const brandPhone =
    settingsMap["invoice_phone"] ||
    settingsMap["phone"] ||
    settingsMap["invoice_company_phone"] ||
    process.env.INVOICE_COMPANY_PHONE ||
    "";
  const brandEmail =
    settingsMap["invoice_email"] ||
    settingsMap["email"] ||
    settingsMap["invoice_company_email"] ||
    process.env.INVOICE_COMPANY_EMAIL ||
    "";
  const brandGstin =
    settingsMap["gst_number"] ||
    settingsMap["invoice_company_gstin"] ||
    process.env.INVOICE_COMPANY_GSTIN ||
    "";
  const brandLogo =
    settingsMap["invoice_header_image"] ||
    settingsMap["store_logo"] ||
    settingsMap["invoice_company_logo"] ||
    "";

  const storelogo = settingsMap["store_logo"];

  const brandFooterImage = settingsMap["invoice_footer_image"] || "";
  const brandDirectorSignature =
    settingsMap["invoice_director_signature"] || "";
  const paymentQrCode = settingsMap["invoice_payment_qr_code"] || "";

  const brandLicense20 =
    settingsMap["drug_license_20"] || settingsMap["license_number"] || "";
  const brandLicense21 = settingsMap["drug_license_21"] || "";
  const brandFssai = settingsMap["fssai_no"] || "";

  const showGst = toBoolean(
    settingsMap["invoice_show_gst"] ?? settingsMap["show_gst"],
  );
  const showLicense = toBoolean(
    settingsMap["invoice_show_license"] ?? settingsMap["show_license"],
  );
  const showPaymentQr = toBoolean(
    settingsMap["invoice_show_payment_qr"] ?? settingsMap["show_payment_qr"],
  );
  const showWatermark = settingsMap["watermark"] === "true";

  const licenseParts: string[] = [];
  if (showGst && brandGstin) {
    licenseParts.push(`GSTIN: ${brandGstin}`);
  }
  if (showLicense) {
    if (brandLicense20) licenseParts.push(`DL (Form 20): ${brandLicense20}`);
    if (brandLicense21) licenseParts.push(`DL (Form 21): ${brandLicense21}`);
    if (brandFssai) licenseParts.push(`FSSAI: ${brandFssai}`);
  }
  const brandLicenseBlock = licenseParts.join(" · ");

  const invoiceTerms = settingsMap["invoice_terms_conditions"] || "";
  const invoiceFooter = settingsMap["invoice_footer_message"] || "";

  const invoiceTermsBlock = invoiceTerms
    ? `<div style="font-weight: bold; margin-bottom: 3px;">Terms & Conditions:</div>
       <div style="white-space: pre-line; margin-bottom: 8px;">${escapeHtml(invoiceTerms)}</div>`
    : "";

  const invoiceFooterBlock = invoiceFooter
    ? `<div style="text-align: center; font-style: italic; margin-top: 5px;">${escapeHtml(invoiceFooter)}</div>`
    : "";

  const directorSignatureBlock = brandDirectorSignature
    ? `<img src="${escapeHtml(brandDirectorSignature)}" alt="Director Signature" style="max-height: 42px; max-width: 160px;" onerror="this.style.display='none'" />`
    : "";

  const paymentQrBlock =
    showPaymentQr && paymentQrCode
      ? `<div style="text-align: right;">
         <div style="font-size: 10px; color: #555; margin-bottom: 4px;">Scan to pay</div>
         <img src="${escapeHtml(paymentQrCode)}" alt="Payment QR" style="max-height: 80px; max-width: 80px;" onerror="this.style.display='none'" />
       </div>`
      : "";

  const footerImageBlock = brandFooterImage
    ? `<div style="margin-bottom: 8px;">
         <img src="${escapeHtml(brandFooterImage)}" alt="Footer Image" style="max-height: 60px; max-width: 100%;" onerror="this.style.display='none'" />
       </div>`
    : "";

  const watermarkContent = storelogo
    ? `<img src="${escapeHtml(storelogo)}" alt="Watermark" style="transform:rotate(-35deg);max-width:350px;max-height:350px;opacity:0.06;user-select:none;-webkit-user-select:none;" />`
    : `<div style="transform:rotate(-35deg);font-size:72px;font-weight:900;color:rgba(0,0,0,0.06);white-space:nowrap;text-transform:uppercase;letter-spacing:12px;user-select:none;-webkit-user-select:none;">${escapeHtml(brandName)}</div>`;

  const watermarkBlock = storelogo
    ? `<div class="watermark-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:9999;overflow:hidden;">
         ${watermarkContent}
       </div>`
    : "";

  return {
    safeTemplateName,
    brandName,
    brandTagline,
    brandAddress,
    brandPhone,
    brandEmail,
    brandGstin,
    brandLogo,
    brandFooterImage,
    brandDirectorSignature,
    paymentQrCode,
    directorSignatureBlock,
    paymentQrBlock,
    footerImageBlock,
    brandLicenseBlock,
    invoiceTermsBlock,
    invoiceFooterBlock,
    watermarkBlock,
    invoiceId: invoice.invoiceId,
    invoiceStatus: toTitleCase(invoice.status),
    paymentMode: displayPaymentMode,
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
    companyContactBlock: [brandPhone, brandEmail].filter(Boolean).join(" · "),
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
    // Fetch settings for organization
    const orgSettings = await rootPrisma.setting.findMany({
      where: {
        organizationId: invoice.organizationId || undefined,
        branchId: null,
      },
    });

    // Fetch settings for branch (if invoice has branchId)
    let branchSettings: any[] = [];
    if (invoice.branchId) {
      branchSettings = await rootPrisma.setting.findMany({
        where: {
          organizationId: invoice.organizationId || undefined,
          branchId: invoice.branchId,
        },
      });
    }

    const settingsMap: Record<string, string> = {};
    orgSettings.forEach((s: { key: string; value: string }) => {
      settingsMap[s.key] = s.value;
    });
    branchSettings.forEach((s: { key: string; value: string }) => {
      settingsMap[s.key] = s.value;
    });

    const selectedTemplate =
      templateName ||
      settingsMap["invoice_template_name"] ||
      settingsMap["invoice_template"] ||
      undefined;

    const { templatePath, safeTemplateName } =
      await resolveTemplatePath(selectedTemplate);
    const template = await fs.readFile(templatePath, "utf8");

    // settingsMap already built above

    // Fallback to Organization fields if no settings are configured yet
    if (!settingsMap["store_name"]) {
      const org = await rootPrisma.organization.findUnique({
        where: { id: invoice.organizationId || undefined },
      });
      if (org) {
        settingsMap["store_name"] = org.name;
        if (org.logo) settingsMap["store_logo"] = org.logo;
        if (org.gstNo) settingsMap["gst_number"] = org.gstNo;
        if (org.licenseNo) settingsMap["license_number"] = org.licenseNo;
      }
    }
    const halfPrint = settingsMap["invoice_half_print"] === "true";

    const data = buildInvoiceData(invoice, safeTemplateName, settingsMap);

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
