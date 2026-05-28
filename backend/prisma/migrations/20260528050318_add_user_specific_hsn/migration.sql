-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterEnum
ALTER TYPE "PaymentMode" ADD VALUE 'SPLIT';

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_branch_id_fkey";

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_brand_id_fkey";

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_manufacturer_id_fkey";

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_unit_id_fkey";

-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Hsn" ADD COLUMN     "created_by_id" TEXT;

-- AlterTable
ALTER TABLE "Inventory" ALTER COLUMN "days_limit" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "InventoryBatch" ALTER COLUMN "expiry_date" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "cash_amount" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
ADD COLUMN     "online_amount" DECIMAL(65,30) NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "discount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "discount_type" TEXT NOT NULL DEFAULT 'flat';

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "Manufacturer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hsn" ADD CONSTRAINT "Hsn_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
