-- Enable pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN trigram indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_masterproduct_name_trgm" ON "MasterProduct" USING gin ("name" gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_masterproduct_salt_trgm" ON "MasterProduct" USING gin ("salt" gin_trgm_ops);

-- Run EXPLAIN ANALYZE for searching name or salt
EXPLAIN ANALYZE
SELECT * FROM "MasterProduct"
WHERE "name" ILIKE '%paracetamol%' OR "salt" ILIKE '%paracetamol%'
ORDER BY "createdAt" DESC
LIMIT 10 OFFSET 0;
