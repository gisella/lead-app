#!/bin/sh

echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=./libs/shared/src/libs/database/prisma/src/database/schema.prisma

echo "Starting application..."
exec node dist/apps/lead-service/main.js
