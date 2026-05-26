#!/bin/bash

set -e

echo "Stopping containers..."
docker compose -f docker-compose.prod.yml down

echo "Building containers..."
docker compose -f docker-compose.prod.yml build

echo "Starting containers..."
docker compose -f docker-compose.prod.yml up -d

echo "Deployment complete 🚀"
docker compose -f docker-compose.prod.yml ps