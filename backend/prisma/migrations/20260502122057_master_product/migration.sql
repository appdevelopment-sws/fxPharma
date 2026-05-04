-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT;

-- CreateTable
CREATE TABLE "Salt" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Salt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry_segment" TEXT DEFAULT '1',
    "image_url" TEXT,
    "category_id" TEXT,
    "brand_id" TEXT,
    "manufacturer_id" TEXT,
    "salt_id" TEXT,
    "hsn_id" TEXT,
    "category_type" TEXT DEFAULT 'TAB',
    "status" TEXT DEFAULT 'CONTINUE',
    "color_type" TEXT DEFAULT 'NORMAL',
    "is_narcotic" BOOLEAN NOT NULL DEFAULT false,
    "is_schedule_h" BOOLEAN NOT NULL DEFAULT false,
    "is_schedule_h1" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterProductBarcode" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "master_product_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterProductBarcode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Salt_name_key" ON "Salt"("name");

-- CreateIndex
CREATE INDEX "MasterProduct_name_idx" ON "MasterProduct"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MasterProductBarcode_value_key" ON "MasterProductBarcode"("value");

-- CreateIndex
CREATE INDEX "MasterProductBarcode_value_idx" ON "MasterProductBarcode"("value");

-- AddForeignKey
ALTER TABLE "MasterProduct" ADD CONSTRAINT "MasterProduct_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterProduct" ADD CONSTRAINT "MasterProduct_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterProduct" ADD CONSTRAINT "MasterProduct_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "Manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterProduct" ADD CONSTRAINT "MasterProduct_salt_id_fkey" FOREIGN KEY ("salt_id") REFERENCES "Salt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterProduct" ADD CONSTRAINT "MasterProduct_hsn_id_fkey" FOREIGN KEY ("hsn_id") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterProductBarcode" ADD CONSTRAINT "MasterProductBarcode_master_product_id_fkey" FOREIGN KEY ("master_product_id") REFERENCES "MasterProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
