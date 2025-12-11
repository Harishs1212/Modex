#!/bin/bash
# Migrate Database to Supabase
# Usage: ./scripts/migrate-supabase.sh [DATABASE_URL]
# Or: ./scripts/migrate-supabase.sh [PROJECT-REF] [PASSWORD]

set -e

# Function to URL encode password
url_encode() {
    local string="${1}"
    local strlen=${#string}
    local encoded=""
    local pos c o

    for (( pos=0 ; pos<strlen ; pos++ )); do
        c=${string:$pos:1}
        case "$c" in
            [-_.~a-zA-Z0-9] ) o="${c}" ;;
            * ) printf -v o '%%%02x' "'$c" ;;
        esac
        encoded+="${o}"
    done
    echo "${encoded}"
}

# Check if we have 2 arguments (project-ref and password) or 1 (full URL)
if [ -z "$1" ]; then
    echo "📋 Supabase Database Migration Script"
    echo ""
    echo "Usage Options:"
    echo ""
    echo "Option 1: Provide full connection string (password will be auto-encoded)"
    echo "   ./scripts/migrate-supabase.sh 'postgresql://postgres:YOUR_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres'"
    echo ""
    echo "Option 2: Provide project ref and password separately"
    echo "   ./scripts/migrate-supabase.sh PROJECT_REF YOUR_PASSWORD"
    echo ""
    echo "Option 3: Set DATABASE_URL environment variable"
    echo "   export DATABASE_URL='postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres'"
    echo "   ./scripts/migrate-supabase.sh"
    echo ""
    echo "⚠️  Note: If your password contains special characters (@, #, %, etc.),"
    echo "   they will be automatically URL-encoded."
    echo ""
    exit 1
fi

# If 2 arguments provided, construct URL
if [ -n "$2" ]; then
    PROJECT_REF="$1"
    PASSWORD="$2"
    ENCODED_PASSWORD=$(url_encode "$PASSWORD")
    export DATABASE_URL="postgresql://postgres:${ENCODED_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"
    echo "🔗 Constructed connection string (password encoded)"
elif [ -n "$1" ]; then
    # Single argument - could be full URL or just project ref
    if [[ "$1" == postgresql://* ]]; then
        # It's a full URL - extract password and encode if needed
        export DATABASE_URL="$1"
        echo "🔗 Using provided connection string"
    else
        # Just project ref - ask for password
        PROJECT_REF="$1"
        echo "🔐 Please enter your Supabase database password:"
        read -s PASSWORD
        ENCODED_PASSWORD=$(url_encode "$PASSWORD")
        export DATABASE_URL="postgresql://postgres:${ENCODED_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"
        echo "🔗 Constructed connection string (password encoded)"
    fi
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL not provided"
    exit 1
fi

echo "🗄️  Migrating database to Supabase..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/../backend"

echo "📦 Generating Prisma Client..."
npx prisma generate

echo "🔄 Running migrations..."
npx prisma migrate deploy

echo ""
echo "✅ Migration complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Verify tables in Supabase dashboard"
echo "   2. (Optional) Seed database: npx prisma db seed"
echo "   3. Test connection: npx prisma studio"
echo ""

