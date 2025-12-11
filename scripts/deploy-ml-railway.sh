#!/bin/bash
# Deploy ML Service to Railway
# Usage: ./scripts/deploy-ml-railway.sh

set -e

echo "🤖 Deploying ML Service to Railway..."
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

# Navigate to ml-service directory
cd "$(dirname "$0")/../ml-service"

echo "🔧 Linking Railway project..."
railway link

echo "🚀 Deploying..."
railway up

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Note the ML service URL from Railway dashboard"
echo "   2. Update ML_SERVICE_URL in backend environment variables"
echo "   3. Check logs: railway logs"
echo ""

