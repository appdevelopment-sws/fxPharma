-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "is_global" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "is_global" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Manufacturer" ADD COLUMN     "is_global" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "is_global" BOOLEAN NOT NULL DEFAULT false;
