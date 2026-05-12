-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('CONTINUE', 'DISCONTINUE');

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "branch_id" TEXT,
    "name" TEXT NOT NULL,
    "status" "InventoryStatus" NOT NULL DEFAULT 'CONTINUE',
    "manufacturer" TEXT,
    "salt_composition" TEXT,
    "category" TEXT DEFAULT 'TAB',
    "packing" TEXT,
    "unit_1st" TEXT,
    "unit_2nd" TEXT,
    "hsn_code" TEXT,
    "item_type" TEXT DEFAULT 'NORMAL',
    "color_type" TEXT DEFAULT 'NORMAL',
    "decimal" TEXT DEFAULT 'No',
    "type" TEXT DEFAULT 'NORMAL',
    "local_tax" TEXT DEFAULT 'Taxable',
    "central_tax" TEXT DEFAULT 'Taxable',
    "sgst" DECIMAL(65,30) DEFAULT 0.0,
    "cgst" DECIMAL(65,30) DEFAULT 0.0,
    "igst" DECIMAL(65,30) DEFAULT 0.0,
    "mrp" DECIMAL(65,30) DEFAULT 0.0,
    "purchase_rate" DECIMAL(65,30) DEFAULT 0.0,
    "cost_per_unit" DECIMAL(65,30) DEFAULT 0.0,
    "rate_a" DECIMAL(65,30) DEFAULT 0.0,
    "rate_b" DECIMAL(65,30) DEFAULT 0.0,
    "rate_c" DECIMAL(65,30) DEFAULT 0.0,
    "cer" DECIMAL(65,30) DEFAULT 0.0,
    "min_qty" INTEGER DEFAULT 0,
    "max_qty" INTEGER DEFAULT 0,
    "reorder_qty" INTEGER DEFAULT 0,
    "days_limit" INTEGER DEFAULT 0,
    "conv_stri" DECIMAL(65,30) DEFAULT 0.0,
    "conv_cas" DECIMAL(65,30) DEFAULT 0.0,
    "volume_discount" DECIMAL(65,30) DEFAULT 0.0,
    "item_discount" DECIMAL(65,30) DEFAULT 0.0,
    "max_discount" DECIMAL(65,30) DEFAULT 0.0,
    "min_margin" DECIMAL(65,30) DEFAULT 0.0,
    "special_discount" DECIMAL(65,30) DEFAULT 0.0,
    "purchase_discount" DECIMAL(65,30) DEFAULT 0.0,
    "is_narcotic" BOOLEAN NOT NULL DEFAULT false,
    "is_schedule_h" BOOLEAN NOT NULL DEFAULT false,
    "is_schedule_h1" BOOLEAN NOT NULL DEFAULT false,
    "hide_product" BOOLEAN NOT NULL DEFAULT false,
    "negative_stock" BOOLEAN NOT NULL DEFAULT false,
    "edit_rates" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewCompound" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "branch_id" TEXT,
    "name" TEXT NOT NULL,
    "dosage_form" TEXT,
    "total_qty" DECIMAL(65,30) DEFAULT 0.0,
    "total_qty_unit" TEXT,
    "days_supply" INTEGER DEFAULT 0,
    "bud_value" INTEGER DEFAULT 0,
    "bud_unit" TEXT DEFAULT 'Days',
    "patient_id" TEXT,
    "provider_id" TEXT,
    "instructions" TEXT,
    "sig" TEXT,
    "requires_homogenizer" BOOLEAN NOT NULL DEFAULT false,
    "requires_unguator" BOOLEAN NOT NULL DEFAULT false,
    "is_light_sensitive" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewCompound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewCompoundIngredient" (
    "id" TEXT NOT NULL,
    "compound_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "quantity" DECIMAL(65,30) DEFAULT 0.0,
    "unit" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewCompoundIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Inventory_organization_id_idx" ON "Inventory"("organization_id");

-- CreateIndex
CREATE INDEX "Inventory_branch_id_idx" ON "Inventory"("branch_id");

-- CreateIndex
CREATE INDEX "Inventory_name_idx" ON "Inventory"("name");

-- CreateIndex
CREATE INDEX "NewCompound_organization_id_idx" ON "NewCompound"("organization_id");

-- CreateIndex
CREATE INDEX "NewCompound_branch_id_idx" ON "NewCompound"("branch_id");

-- CreateIndex
CREATE INDEX "NewCompound_name_idx" ON "NewCompound"("name");

-- CreateIndex
CREATE INDEX "NewCompoundIngredient_compound_id_idx" ON "NewCompoundIngredient"("compound_id");

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewCompound" ADD CONSTRAINT "NewCompound_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewCompound" ADD CONSTRAINT "NewCompound_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewCompoundIngredient" ADD CONSTRAINT "NewCompoundIngredient_compound_id_fkey" FOREIGN KEY ("compound_id") REFERENCES "NewCompound"("id") ON DELETE CASCADE ON UPDATE CASCADE;
