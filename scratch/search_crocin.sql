EXPLAIN ANALYZE
SELECT * FROM "MasterProduct"
WHERE "name" ILIKE '%crocin%' OR "salt" ILIKE '%crocin%'
ORDER BY "createdAt" DESC
LIMIT 10 OFFSET 0;
