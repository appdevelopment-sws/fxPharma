/*
  Warnings:

  - You are about to drop the column `salt_id` on the `MasterProduct` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MasterProduct" DROP CONSTRAINT "MasterProduct_salt_id_fkey";

-- AlterTable
ALTER TABLE "MasterProduct" DROP COLUMN "salt_id",
ADD COLUMN     "salt" TEXT;
