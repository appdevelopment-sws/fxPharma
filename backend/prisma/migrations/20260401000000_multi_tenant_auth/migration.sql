-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INVITED', 'DISABLED');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- Create legacy tenant for existing records
INSERT INTO "Tenant" ("id", "name", "slug", "status", "createdAt", "updatedAt")
VALUES ('legacy-tenant', 'Legacy Tenant', 'legacy-tenant', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable
ALTER TABLE "Role" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "Role" ADD COLUMN "isDefault" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Role" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Role"
SET "tenantId" = 'legacy-tenant'
WHERE "tenantId" IS NULL;

ALTER TABLE "Role" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "User" ADD COLUMN "name" TEXT;
ALTER TABLE "User" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

UPDATE "User"
SET
  "tenantId" = 'legacy-tenant',
  "name" = COALESCE(NULLIF(split_part("email", '@', 1), ''), 'Legacy User')
WHERE "tenantId" IS NULL;

ALTER TABLE "User" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

-- DropIndex
DROP INDEX "User_email_key";

-- DropIndex
DROP INDEX "Role_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_id_key" ON "User"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE INDEX "User_tenantId_roleId_idx" ON "User"("tenantId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_tenantId_id_key" ON "Role"("tenantId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Role_tenantId_name_key" ON "Role"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Role_tenantId_idx" ON "Role"("tenantId");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
