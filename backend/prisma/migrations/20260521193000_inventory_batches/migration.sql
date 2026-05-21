-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "invoice_no" TEXT,
ADD COLUMN     "received_at" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "batch_no" TEXT,
ADD COLUMN     "expiry" TEXT,
ADD COLUMN     "free_qty" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "InventoryBatch" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "branch_id" TEXT,
    "inventory_id" TEXT NOT NULL,
    "order_id" TEXT,
    "order_item_id" TEXT,
    "batch_no" TEXT NOT NULL,
    "expiry" TEXT,
    "expiry_date" TIMESTAMP(3),
    "unit" TEXT,
    "received_qty" INTEGER NOT NULL DEFAULT 0,
    "available_qty" INTEGER NOT NULL DEFAULT 0,
    "purchase_rate" DECIMAL(65,30) DEFAULT 0.0,
    "mrp" DECIMAL(65,30) DEFAULT 0.0,
    "rate_a" DECIMAL(65,30) DEFAULT 0.0,
    "rate_b" DECIMAL(65,30) DEFAULT 0.0,
    "rate_c" DECIMAL(65,30) DEFAULT 0.0,
    "cgst" DECIMAL(65,30) DEFAULT 0.0,
    "sgst" DECIMAL(65,30) DEFAULT 0.0,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryBatch_inventory_id_idx" ON "InventoryBatch"("inventory_id");

-- CreateIndex
CREATE INDEX "InventoryBatch_organization_id_idx" ON "InventoryBatch"("organization_id");

-- CreateIndex
CREATE INDEX "InventoryBatch_branch_id_idx" ON "InventoryBatch"("branch_id");

-- CreateIndex
CREATE INDEX "InventoryBatch_order_id_idx" ON "InventoryBatch"("order_id");

-- CreateIndex
CREATE INDEX "InventoryBatch_order_item_id_idx" ON "InventoryBatch"("order_item_id");

-- CreateIndex
CREATE INDEX "InventoryBatch_batch_no_idx" ON "InventoryBatch"("batch_no");

-- CreateIndex
CREATE INDEX "InventoryBatch_expiry_date_idx" ON "InventoryBatch"("expiry_date");

-- AddForeignKey
ALTER TABLE "InventoryBatch" ADD CONSTRAINT "InventoryBatch_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryBatch" ADD CONSTRAINT "InventoryBatch_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryBatch" ADD CONSTRAINT "InventoryBatch_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryBatch" ADD CONSTRAINT "InventoryBatch_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryBatch" ADD CONSTRAINT "InventoryBatch_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
