-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "payment_mode" TEXT;
ALTER TABLE "Order" ADD COLUMN     "payment_details" TEXT;
ALTER TABLE "Order" ADD COLUMN     "is_udhar" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN     "paid_amount" DECIMAL(65,30) NOT NULL DEFAULT 0.0;
