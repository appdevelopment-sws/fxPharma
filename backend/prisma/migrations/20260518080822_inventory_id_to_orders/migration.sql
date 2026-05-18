/*
  Warnings:

  - You are about to drop the column `description` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `OrderItem` table. All the data in the column will be lost.
  - Added the required column `inventory_id` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "description",
DROP COLUMN "name",
ADD COLUMN     "inventory_id" TEXT NOT NULL,
ADD COLUMN     "purchase_rate" DECIMAL(65,30),
ADD COLUMN     "received_qty" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "OrderItem_inventory_id_idx" ON "OrderItem"("inventory_id");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
