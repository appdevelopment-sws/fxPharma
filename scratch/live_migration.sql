-- 1. Enable the pg_trgm extension if it isn't already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Populate search_text for all existing master products where it is currently NULL/empty
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
)
WHERE mp."search_text" IS NULL;

-- 3. Update database statistics for the query planner
ANALYZE "MasterProduct";
