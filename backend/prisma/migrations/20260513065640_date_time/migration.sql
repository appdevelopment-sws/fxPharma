/*
  Warnings:

  - The `days_limit` column on the `Inventory` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Inventory" DROP COLUMN "days_limit",
ADD COLUMN     "days_limit" TIMESTAMP(3);
