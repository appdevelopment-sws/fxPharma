-- CreateEnum
CREATE TYPE "SalesReturnStatus" AS ENUM ('REFUNDED', 'PENDING', 'REJECTED');

-- CreateTable
CREATE TABLE "SalesReturn" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "branch_id" TEXT,
    "invoice_id" TEXT NOT NULL,
    "return_id" TEXT NOT NULL,
    "original_invoice" TEXT NOT NULL,
    "customer_name" TEXT,
    "customer_phone" TEXT,
    "return_value" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "reason" TEXT NOT NULL,
    "status" "SalesReturnStatus" NOT NULL DEFAULT 'REFUNDED',
    "items_restocked" INTEGER NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "tax" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "restocking_fee" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "refund_method" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesReturnItem" (
    "id" TEXT NOT NULL,
    "sales_return_id" TEXT NOT NULL,
    "invoice_item_id" TEXT,
    "inventory_id" TEXT NOT NULL,
    "batch_id" TEXT,
    "name" TEXT NOT NULL,
    "batch" TEXT,
    "expiry" TEXT,
    "unit_price" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "purchased_qty" INTEGER NOT NULL DEFAULT 0,
    "return_qty" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT NOT NULL,
    "refund_amt" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesReturnItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalesReturn_return_id_key" ON "SalesReturn"("return_id");

-- CreateIndex
CREATE INDEX "SalesReturn_organization_id_idx" ON "SalesReturn"("organization_id");

-- CreateIndex
CREATE INDEX "SalesReturn_branch_id_idx" ON "SalesReturn"("branch_id");

-- CreateIndex
CREATE INDEX "SalesReturn_invoice_id_idx" ON "SalesReturn"("invoice_id");

-- CreateIndex
CREATE INDEX "SalesReturn_created_at_idx" ON "SalesReturn"("created_at");

-- CreateIndex
CREATE INDEX "SalesReturn_return_id_idx" ON "SalesReturn"("return_id");

-- CreateIndex
CREATE INDEX "SalesReturn_original_invoice_idx" ON "SalesReturn"("original_invoice");

-- CreateIndex
CREATE INDEX "SalesReturnItem_sales_return_id_idx" ON "SalesReturnItem"("sales_return_id");

-- CreateIndex
CREATE INDEX "SalesReturnItem_invoice_item_id_idx" ON "SalesReturnItem"("invoice_item_id");

-- CreateIndex
CREATE INDEX "SalesReturnItem_inventory_id_idx" ON "SalesReturnItem"("inventory_id");

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesReturnItem" ADD CONSTRAINT "SalesReturnItem_sales_return_id_fkey" FOREIGN KEY ("sales_return_id") REFERENCES "SalesReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
