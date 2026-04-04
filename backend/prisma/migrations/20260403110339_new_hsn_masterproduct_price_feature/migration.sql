/*
  Warnings:

  - You are about to drop the column `hsn_id` on the `MasterProduct` table. All the data in the column will be lost.
  - You are about to drop the `HsnTable` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `hsnCodeId` to the `MasterProduct` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaxType" AS ENUM ('INCLUSIVE', 'EXCLUSIVE');

-- CreateEnum
CREATE TYPE "HsnType" AS ENUM ('GOODS', 'SERVICE');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- DropForeignKey
ALTER TABLE "MasterProduct" DROP CONSTRAINT "MasterProduct_hsn_id_fkey";

-- DropIndex
DROP INDEX "MasterProduct_hsn_id_idx";

-- AlterTable
ALTER TABLE "MasterProduct" DROP COLUMN "hsn_id",
ADD COLUMN     "hsnCodeId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "HsnTable";

-- CreateTable
CREATE TABLE "HsnCode" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "description" TEXT,
    "type" "HsnType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HsnCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRule" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50),
    "rate" DECIMAL(5,2) NOT NULL,
    "type" "TaxType" NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HsnTaxMapping" (
    "id" SERIAL NOT NULL,
    "hsnCodeId" INTEGER NOT NULL,
    "taxRuleId" INTEGER NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HsnTaxMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL,
    "maxUsers" INTEGER,
    "maxInvoices" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanFeature" (
    "id" SERIAL NOT NULL,
    "planId" INTEGER NOT NULL,
    "featureId" INTEGER NOT NULL,

    CONSTRAINT "PlanFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantSubscription" (
    "id" SERIAL NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantFeature" (
    "id" SERIAL NOT NULL,
    "tenantId" TEXT NOT NULL,
    "featureId" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,

    CONSTRAINT "TenantFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantSetting" (
    "tenantId" TEXT NOT NULL,
    "inventoryEnabled" BOOLEAN NOT NULL DEFAULT true,
    "rackEnabled" BOOLEAN NOT NULL DEFAULT false,
    "batchEnabled" BOOLEAN NOT NULL DEFAULT false,
    "expiryEnabled" BOOLEAN NOT NULL DEFAULT false,
    "gstEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TenantSetting_pkey" PRIMARY KEY ("tenantId")
);

-- CreateIndex
CREATE UNIQUE INDEX "HsnCode_code_key" ON "HsnCode"("code");

-- CreateIndex
CREATE INDEX "HsnTaxMapping_hsnCodeId_idx" ON "HsnTaxMapping"("hsnCodeId");

-- CreateIndex
CREATE INDEX "HsnTaxMapping_taxRuleId_idx" ON "HsnTaxMapping"("taxRuleId");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_key_key" ON "Feature"("key");

-- CreateIndex
CREATE UNIQUE INDEX "PlanFeature_planId_featureId_key" ON "PlanFeature"("planId", "featureId");

-- CreateIndex
CREATE INDEX "TenantSubscription_tenantId_idx" ON "TenantSubscription"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantFeature_tenantId_featureId_key" ON "TenantFeature"("tenantId", "featureId");

-- CreateIndex
CREATE INDEX "MasterProduct_hsnCodeId_idx" ON "MasterProduct"("hsnCodeId");

-- AddForeignKey
ALTER TABLE "HsnTaxMapping" ADD CONSTRAINT "HsnTaxMapping_hsnCodeId_fkey" FOREIGN KEY ("hsnCodeId") REFERENCES "HsnCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HsnTaxMapping" ADD CONSTRAINT "HsnTaxMapping_taxRuleId_fkey" FOREIGN KEY ("taxRuleId") REFERENCES "TaxRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFeature" ADD CONSTRAINT "PlanFeature_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanFeature" ADD CONSTRAINT "PlanFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSubscription" ADD CONSTRAINT "TenantSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSubscription" ADD CONSTRAINT "TenantSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantFeature" ADD CONSTRAINT "TenantFeature_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantFeature" ADD CONSTRAINT "TenantFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSetting" ADD CONSTRAINT "TenantSetting_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterProduct" ADD CONSTRAINT "MasterProduct_hsnCodeId_fkey" FOREIGN KEY ("hsnCodeId") REFERENCES "HsnCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
