/*
  Warnings:

  - You are about to drop the column `branchId` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `Manufacturer` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Manufacturer` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `Unit` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `Unit` table. All the data in the column will be lost.
  - Added the required column `organization_id` to the `Brand` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `Manufacturer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `Unit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Brand" DROP CONSTRAINT "Brand_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Brand" DROP CONSTRAINT "Brand_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Manufacturer" DROP CONSTRAINT "Manufacturer_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Manufacturer" DROP CONSTRAINT "Manufacturer_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Unit" DROP CONSTRAINT "Unit_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Unit" DROP CONSTRAINT "Unit_organizationId_fkey";

-- AlterTable
ALTER TABLE "Brand" DROP COLUMN "branchId",
DROP COLUMN "organizationId",
ADD COLUMN     "branch_id" TEXT,
ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "branchId",
DROP COLUMN "organizationId",
ADD COLUMN     "branch_id" TEXT,
ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Manufacturer" DROP COLUMN "branchId",
DROP COLUMN "organizationId",
ADD COLUMN     "branch_id" TEXT,
ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Unit" DROP COLUMN "branchId",
DROP COLUMN "organizationId",
ADD COLUMN     "branch_id" TEXT,
ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manufacturer" ADD CONSTRAINT "Manufacturer_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manufacturer" ADD CONSTRAINT "Manufacturer_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
