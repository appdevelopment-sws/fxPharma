-- AlterTable
ALTER TABLE "HsnMapping" ADD COLUMN     "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "effective_to" TIMESTAMP(3);
