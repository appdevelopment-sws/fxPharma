/*
  Warnings:

  - You are about to drop the column `name` on the `Organization` table. All the data in the column will be lost.
  - The `status` column on the `Organization` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mobile]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `city` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state_province` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `store_name` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street_address` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zip_code` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'BLOCK');

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "name",
ADD COLUMN     "category" TEXT,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "currency" TEXT DEFAULT 'INR',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "gst_no" TEXT,
ADD COLUMN     "license_no" TEXT,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "owner_id" TEXT,
ADD COLUMN     "state_province" TEXT NOT NULL,
ADD COLUMN     "store_name" TEXT NOT NULL,
ADD COLUMN     "street_address" TEXT NOT NULL,
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "zip_code" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "last_name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
