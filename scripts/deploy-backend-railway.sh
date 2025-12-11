#!/bin/bash
# Deploy Backend to Railway
# Usage: ./scripts/deploy-backend-railway.sh

set -e

echo "🚂 Deploying Backend to Railway..."
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   npm i -g @railway/cli"
    echo "   railway login"
    exit 1
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please run: railway login"
    exit 1
fi

echo "📋 Current Railway user:"
railway whoami
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/../backend"

echo "🔧 Linking Railway project..."
railway link

echo "🚀 Deploying..."
railway up

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Set environment variables in Railway dashboard"
echo "   2. Run migrations: railway run npx prisma migrate deploy"
echo "   3. Check logs: railway logs"
echo ""

