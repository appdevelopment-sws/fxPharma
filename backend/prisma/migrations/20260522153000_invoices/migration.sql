-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'UPI', 'CARD');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PAID', 'REFUNDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "branch_id" TEXT,
    "invoice_id" TEXT NOT NULL,
    "customer_name" TEXT,
    "customer_phone" TEXT,
    "payment_mode" "PaymentMode" NOT NULL DEFAULT 'CASH',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PAID',
    "gross_amount" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "discount_amount" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "tax_amount" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "delivery_cost" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "total_amount" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "tendered_amount" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "change_amount" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "inventory_id" TEXT NOT NULL,
    "inventory_name" TEXT NOT NULL,
    "batch_id" TEXT,
    "batch_no" TEXT,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "sell_unit" TEXT NOT NULL DEFAULT 'strip',
    "rate_type" TEXT NOT NULL DEFAULT 'mrp',
    "rate_value" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "item_discount" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "sub_total" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoice_id_key" ON "Invoice"("invoice_id");

-- CreateIndex
CREATE INDEX "Invoice_organization_id_idx" ON "Invoice"("organization_id");

-- CreateIndex
CREATE INDEX "Invoice_branch_id_idx" ON "Invoice"("branch_id");

-- CreateIndex
CREATE INDEX "Invoice_created_at_idx" ON "Invoice"("created_at");

-- CreateIndex
CREATE INDEX "Invoice_invoice_id_idx" ON "Invoice"("invoice_id");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoice_id_idx" ON "InvoiceItem"("invoice_id");

-- CreateIndex
CREATE INDEX "InvoiceItem_inventory_id_idx" ON "InvoiceItem"("inventory_id");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
