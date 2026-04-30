-- DropForeignKey
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_scope_id_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_scope_id_fkey";

-- DropForeignKey
ALTER TABLE "UserWorkflow" DROP CONSTRAINT "UserWorkflow_scope_id_fkey";

-- AlterTable
ALTER TABLE "UserPermission" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "UserRole" ADD COLUMN     "branchId" TEXT;

-- AlterTable
ALTER TABLE "UserWorkflow" ADD COLUMN     "branchId" TEXT;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWorkflow" ADD CONSTRAINT "UserWorkflow_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
