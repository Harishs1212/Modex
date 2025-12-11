#!/bin/bash
set -e

echo "Waiting for database to be ready..."
# Wait for postgres to be ready using netcat
until nc -z postgres 5432; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"
echo "Running migrations..."
npx prisma migrate deploy || {
  echo "Migration failed, trying to sync schema..."
  npx prisma db push --skip-generate || {
    echo "Schema sync also failed, but continuing..."
  }
}

echo "Starting application..."
exec npm start

