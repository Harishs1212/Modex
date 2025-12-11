#!/bin/bash
# Complete Cloud Setup Script
# This script helps set up all cloud services

set -e

echo "☁️  NeoCareSync Cloud Deployment Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}This script will guide you through setting up:${NC}"
echo "  1. Supabase Database"
echo "  2. Upstash Redis"
echo "  3. Railway Backend"
echo "  4. Railway ML Service"
echo "  5. Vercel Frontend"
echo ""

read -p "Press Enter to continue..."

# Check prerequisites
echo ""
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 20+${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm --version)${NC}"

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}⚠️  Railway CLI not found${NC}"
    echo "   Install with: npm i -g @railway/cli"
    echo "   Then run: railway login"
else
    echo -e "${GREEN}✅ Railway CLI installed${NC}"
fi

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found${NC}"
    echo "   Install with: npm i -g vercel"
    echo "   Then run: vercel login"
else
    echo -e "${GREEN}✅ Vercel CLI installed${NC}"
fi

echo ""
echo "📋 Setup Checklist:"
echo ""
echo "1. Supabase Database:"
echo "   - Go to https://supabase.com"
echo "   - Create a new project"
echo "   - Copy the connection string from Settings → Database"
echo "   - Run: ./scripts/migrate-supabase.sh [DATABASE_URL]"
echo ""
echo "2. Upstash Redis:"
echo "   - Go to https://upstash.com"
echo "   - Create a new Redis database"
echo "   - Copy the endpoint and password"
echo ""
echo "3. Railway Backend:"
echo "   - Go to https://railway.app"
echo "   - Create a new project"
echo "   - Connect your GitHub repository"
echo "   - Set root directory to 'backend'"
echo "   - Add environment variables (see backend/.env.example)"
echo "   - Or use: ./scripts/deploy-backend-railway.sh"
echo ""
echo "4. Railway ML Service:"
echo "   - Create a new service in Railway"
echo "   - Set root directory to 'ml-service'"
echo "   - Add PORT environment variable"
echo "   - Or use: ./scripts/deploy-ml-railway.sh"
echo ""
echo "5. Vercel Frontend:"
echo "   - Go to https://vercel.com"
echo "   - Import your GitHub repository"
echo "   - Set root directory to 'frontend'"
echo "   - Add VITE_API_URL environment variable"
echo "   - Deploy"
echo ""

echo -e "${GREEN}✅ Setup guide complete!${NC}"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"

