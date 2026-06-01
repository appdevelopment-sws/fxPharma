EXPLAIN ANALYZE
SELECT "MasterProduct".* FROM "MasterProduct"
LEFT JOIN "Brand" ON "Brand"."id" = "MasterProduct"."brand_id"
LEFT JOIN "Manufacturer" ON "Manufacturer"."id" = "MasterProduct"."manufacturer_id"
LEFT JOIN "Category" ON "Category"."id" = "MasterProduct"."category_id"
LEFT JOIN "Hsn" ON "Hsn"."id" = "MasterProduct"."hsn_id"
WHERE (
  "MasterProduct"."name" ILIKE '%paracetamol%'
  OR "MasterProduct"."salt" ILIKE '%paracetamol%'
  OR "MasterProduct"."category_type" ILIKE '%paracetamol%'
  OR EXISTS (SELECT 1 FROM "Brand" AS "B" WHERE "B"."id" = "MasterProduct"."brand_id" AND "B"."name" ILIKE '%paracetamol%')
  OR EXISTS (SELECT 1 FROM "Manufacturer" AS "M" WHERE "M"."id" = "MasterProduct"."manufacturer_id" AND "M"."name" ILIKE '%paracetamol%')
  OR EXISTS (SELECT 1 FROM "Category" AS "C" WHERE "C"."id" = "MasterProduct"."category_id" AND "C"."name" ILIKE '%paracetamol%')
  OR EXISTS (SELECT 1 FROM "Hsn" AS "H" WHERE "H"."id" = "MasterProduct"."hsn_id" AND ("H"."hsncode" ILIKE '%paracetamol%' OR "H"."description" ILIKE '%paracetamol%'))
  OR EXISTS (SELECT 1 FROM "MasterProductBarcode" AS "BC" WHERE "BC"."master_product_id" = "MasterProduct"."id" AND "BC"."value" ILIKE '%paracetamol%')
)
ORDER BY "MasterProduct"."createdAt" DESC
LIMIT 10 OFFSET 0;
