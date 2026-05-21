-- CreateTable
CREATE TABLE "OrderPayment" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "branch_id" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "payment_mode" TEXT,
    "payment_details" TEXT,
    "is_udhar" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderPayment_order_id_idx" ON "OrderPayment"("order_id");

-- CreateIndex
CREATE INDEX "OrderPayment_organization_id_idx" ON "OrderPayment"("organization_id");

-- CreateIndex
CREATE INDEX "OrderPayment_branch_id_idx" ON "OrderPayment"("branch_id");

-- AddForeignKey
ALTER TABLE "OrderPayment" ADD CONSTRAINT "OrderPayment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
