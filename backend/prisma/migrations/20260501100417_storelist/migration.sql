-- CreateTable
CREATE TABLE "store_lists" (
    "id" TEXT NOT NULL,
    "store_name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "logo" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "owner_first_name" TEXT NOT NULL,
    "owner_last_name" TEXT NOT NULL,
    "owner_email" TEXT NOT NULL,
    "owner_phone" TEXT NOT NULL,
    "login_email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "gst_no" TEXT,
    "license_no" TEXT,
    "street_address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state_province" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "timezone" TEXT,
    "currency" TEXT DEFAULT 'INR',
    "plan_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_lists_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "store_lists" ADD CONSTRAINT "store_lists_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
