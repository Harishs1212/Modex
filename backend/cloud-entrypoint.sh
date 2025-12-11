#!/bin/bash
set -e

echo "🚀 Starting NeoCareSync Backend..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

echo "📦 Generating Prisma Client..."
npx prisma generate

echo "🔄 Running database migrations..."
npx prisma migrate deploy || {
  echo "⚠️  Migration failed, attempting to sync schema..."
  npx prisma db push --skip-generate || {
    echo "❌ Schema sync failed. Please check your database connection."
    exit 1
  }
}

echo "✅ Database migrations completed"
echo "🚀 Starting application..."
exec npm start

