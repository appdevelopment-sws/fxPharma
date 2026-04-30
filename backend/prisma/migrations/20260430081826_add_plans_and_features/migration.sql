/*
  Warnings:

  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HsnCode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Inventory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MasterProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchaseOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sale` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SaleItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Supplier` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM');

-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "HsnCode" DROP CONSTRAINT "HsnCode_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_masterProductId_fkey";

-- DropForeignKey
ALTER TABLE "MasterProduct" DROP CONSTRAINT "MasterProduct_companyId_fkey";

-- DropForeignKey
ALTER TABLE "MasterProduct" DROP CONSTRAINT "MasterProduct_hsnCodeId_fkey";

-- DropForeignKey
ALTER TABLE "MasterProduct" DROP CONSTRAINT "MasterProduct_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "MasterProduct" DROP CONSTRAINT "MasterProduct_productTypeId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_branchId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_userId_fkey";

-- DropForeignKey
ALTER TABLE "SaleItem" DROP CONSTRAINT "SaleItem_masterProductId_fkey";

-- DropForeignKey
ALTER TABLE "SaleItem" DROP CONSTRAINT "SaleItem_saleId_fkey";

-- DropForeignKey
ALTER TABLE "Supplier" DROP CONSTRAINT "Supplier_organizationId_fkey";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "planId" TEXT;

-- DropTable
DROP TABLE "Company";

-- DropTable
DROP TABLE "HsnCode";

-- DropTable
DROP TABLE "Inventory";

-- DropTable
DROP TABLE "MasterProduct";

-- DropTable
DROP TABLE "ProductType";

-- DropTable
DROP TABLE "PurchaseOrder";

-- DropTable
DROP TABLE "Sale";

-- DropTable
DROP TABLE "SaleItem";

-- DropTable
DROP TABLE "Supplier";

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "short_description" TEXT,
    "description" JSONB,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "billing_cycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "duration_days" INTEGER NOT NULL DEFAULT 30,
    "price_breakdown" JSONB,
    "max_staff" INTEGER NOT NULL DEFAULT 1,
    "max_branches" INTEGER NOT NULL DEFAULT 1,
    "storage_limit" INTEGER NOT NULL DEFAULT 1024,
    "advanced_features" JSONB,
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "badge_text" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanFeature" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "config" JSONB,

    CONSTRAINT "PlanFeature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_key_key" ON "Plan"("key");

-- CreateIndex
CREATE UNIQUE INDEX "PlanFeature_planId_featureId_key" ON "PlanFeature"("planId", "featureId");

-- AddForeignKey
ALTER TABLE "PlanFeature" ADD CONSTRAINT "PlanFeature_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFeature" ADD CONSTRAINT "PlanFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
