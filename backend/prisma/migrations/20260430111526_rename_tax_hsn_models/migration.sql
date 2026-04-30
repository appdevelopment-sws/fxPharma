/*
  Warnings:

  - You are about to drop the `hsn` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hsnmapping` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tax` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "hsnmapping" DROP CONSTRAINT "hsnmapping_hsnid_fkey";

-- DropForeignKey
ALTER TABLE "hsnmapping" DROP CONSTRAINT "hsnmapping_taxid_fkey";

-- DropTable
DROP TABLE "hsn";

-- DropTable
DROP TABLE "hsnmapping";

-- DropTable
DROP TABLE "tax";

-- CreateTable
CREATE TABLE "Tax" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "tax_type" "TaxType" NOT NULL DEFAULT 'Exclusive',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hsn" (
    "id" TEXT NOT NULL,
    "hsncode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hsn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HsnMapping" (
    "id" TEXT NOT NULL,
    "hsnid" TEXT NOT NULL,
    "taxid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HsnMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HsnMapping_hsnid_taxid_key" ON "HsnMapping"("hsnid", "taxid");

-- AddForeignKey
ALTER TABLE "HsnMapping" ADD CONSTRAINT "HsnMapping_hsnid_fkey" FOREIGN KEY ("hsnid") REFERENCES "Hsn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HsnMapping" ADD CONSTRAINT "HsnMapping_taxid_fkey" FOREIGN KEY ("taxid") REFERENCES "Tax"("id") ON DELETE CASCADE ON UPDATE CASCADE;
