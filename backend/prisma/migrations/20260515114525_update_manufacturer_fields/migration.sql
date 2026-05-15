/*
  Warnings:

  - Made the column `email` on table `Manufacturer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `Manufacturer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `Manufacturer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Manufacturer" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL;
