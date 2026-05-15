-- AlterTable
ALTER TABLE "Hsn" ADD COLUMN     "isGlobal" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "HsnMapping" ADD COLUMN     "isGlobal" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Tax" ADD COLUMN     "isGlobal" BOOLEAN NOT NULL DEFAULT false;
