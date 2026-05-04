-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "gst_number" TEXT NOT NULL,
    "office_address" TEXT NOT NULL,
    "registration_documents" TEXT,
    "contact_person_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp_number" TEXT NOT NULL,
    "is_preferred" BOOLEAN NOT NULL DEFAULT false,
    "auto_generate_po" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Supplier_organization_id_idx" ON "Supplier"("organization_id");

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
