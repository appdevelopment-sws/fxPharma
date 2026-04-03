/*
  Warnings:

  - You are about to drop the `MasterMedicine` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MasterMedicine" DROP CONSTRAINT "MasterMedicine_company_id_fkey";

-- DropForeignKey
ALTER TABLE "MasterMedicine" DROP CONSTRAINT "MasterMedicine_hsn_id_fkey";

-- DropForeignKey
ALTER TABLE "MasterMedicine" DROP CONSTRAINT "MasterMedicine_product_type_id_fkey";

-- DropTable
DROP TABLE "MasterMedicine";

-- CreateTable
CREATE TABLE "MasterProduct" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "barcode" TEXT,
    "brand_name" TEXT,
    "pack_size" TEXT,
    "strength" TEXT,
    "hsn_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "product_type_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasterProduct_barcode_key" ON "MasterProduct"("barcode");

-- CreateIndex
CREATE INDEX "MasterProduct_company_id_idx" ON "MasterProduct"("company_id");

-- CreateIndex
CREATE INDEX "MasterProduct_product_type_id_idx" ON "MasterProduct"("product_type_id");

-- CreateIndex
CREATE INDEX "MasterProduct_hsn_id_idx" ON "MasterProduct"("hsn_id");

-- CreateIndex
CREATE UNIQUE INDEX "MasterProduct_name_strength_company_id_key" ON "MasterProduct"("name", "strength", "company_id");

-- AddForeignKey
ALTER TABLE "MasterProduct" ADD CONSTRAINT "MasterProduct_hsn_id_fkey" FOREIGN KEY ("hsn_id") REFERENCES "HsnTable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterProduct" ADD CONSTRAINT "MasterProduct_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterProduct" ADD CONSTRAINT "MasterProduct_product_type_id_fkey" FOREIGN KEY ("product_type_id") REFERENCES "ProductType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
