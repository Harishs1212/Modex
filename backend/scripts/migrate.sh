#!/bin/sh
# Prisma Migration Script
# Works with both local PostgreSQL and Supabase

echo "🔄 Running Prisma migrations..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo "Please set DATABASE_URL in your .env file or environment"
  exit 1
fi

# Run migrations
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully!"
else
  echo "❌ Migration failed. Please check your DATABASE_URL and database connection."
  exit 1
fi

