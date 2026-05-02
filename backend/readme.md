## project documentation

The auth model database schema


to generate the migration

```bash
docker compose exec backend npx prisma migrate dev --name remove_store_lists
```
visualize the database:
```bash
npx prisma studio --url="postgresql://postgrespharmacyuser:supersecretpassword@localhost:5432/pharmacydawadukaandb"
```


```bash
docker compose exec backend npx prisma migrate generate
```
