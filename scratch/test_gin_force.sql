BEGIN;

-- Enable pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- AlterTable
ALTER TABLE "MasterProduct" ADD COLUMN IF NOT EXISTS "search_text" TEXT;

-- Update existing data
UPDATE "MasterProduct" mp
SET "search_text" = CONCAT_WS(' ',
  COALESCE(mp."name", ''),
  COALESCE(mp."salt", ''),
  COALESCE(mp."category_type", ''),
  COALESCE((SELECT b."name" FROM "Brand" b WHERE b."id" = mp."brand_id"), ''),
  COALESCE((SELECT m."name" FROM "Manufacturer" m WHERE m."id" = mp."manufacturer_id"), ''),
  COALESCE((SELECT c."name" FROM "Category" c WHERE c."id" = mp."category_id"), ''),
  COALESCE((SELECT h."hsncode" FROM "Hsn" h WHERE h."id" = mp."hsn_id"), ''),
  COALESCE((SELECT h."description" FROM "Hsn" h WHERE h."id" = mp."hsn_id"), ''),
  COALESCE((SELECT STRING_AGG(bc."value", ' ') FROM "MasterProductBarcode" bc WHERE bc."master_product_id" = mp."id"), '')
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_masterproduct_search_text_trgm" ON "MasterProduct" USING gin ("search_text" gin_trgm_ops);

-- Run ANALYZE to update statistics
ANALYZE "MasterProduct";

-- Disable sequential scans
SET enable_seqscan = off;

-- Run EXPLAIN ANALYZE on search_text (crocin)
EXPLAIN ANALYZE
SELECT * FROM "MasterProduct"
WHERE "search_text" ILIKE '%crocin%'
ORDER BY "createdAt" DESC
LIMIT 10 OFFSET 0;

ROLLBACK;
