#!/bin/bash
# Upstash Redis Setup Helper
# This script helps you get the correct Redis connection details

set -e

echo "🔴 Upstash Redis Setup Helper"
echo "=============================="
echo ""

echo "You've provided REST API credentials:"
echo "  REST URL: https://striking-redfish-10121.upstash.io"
echo "  REST Token: ASeJAAIncDE2MTMxZjc0ZDI5NDk0MDE2OTFmZjI2NDE2NDQxOWQ5MXAxMTAxMjE"
echo ""

echo "⚠️  IMPORTANT: The backend uses 'ioredis' which requires TRADITIONAL Redis connection,"
echo "   not REST API. You need to get the Redis Protocol connection details."
echo ""

echo "📋 Steps to get Redis Protocol connection details:"
echo ""
echo "1. Go to: https://console.upstash.com"
echo "2. Select your database: striking-redfish-10121"
echo "3. Click on the 'Redis' tab (NOT 'REST API' tab)"
echo "4. You'll see:"
echo "   - Endpoint (this is your REDIS_HOST)"
echo "   - Port (usually 6379, this is your REDIS_PORT)"
echo "   - Password (click 'Show' to reveal, this is your REDIS_PASSWORD)"
echo ""

echo "🔗 Quick Link:"
echo "   https://console.upstash.com/redis/striking-redfish-10121"
echo ""

echo "📝 Once you have the details, set these environment variables in Railway/Render:"
echo ""
echo "   REDIS_HOST=striking-redfish-10121.upstash.io"
echo "   REDIS_PORT=6379"
echo "   REDIS_PASSWORD=[YOUR-PASSWORD-FROM-REDIS-TAB]"
echo ""

echo "💡 Note: The password from the 'Redis' tab is DIFFERENT from the REST token!"
echo ""

read -p "Do you have the Redis Protocol password? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📋 Please enter your Redis connection details:"
    echo ""
    
    read -p "REDIS_HOST [striking-redfish-10121.upstash.io]: " REDIS_HOST
    REDIS_HOST=${REDIS_HOST:-striking-redfish-10121.upstash.io}
    
    read -p "REDIS_PORT [6379]: " REDIS_PORT
    REDIS_PORT=${REDIS_PORT:-6379}
    
    read -sp "REDIS_PASSWORD: " REDIS_PASSWORD
    echo ""
    
    echo ""
    echo "✅ Here are your environment variables for Railway/Render:"
    echo ""
    echo "REDIS_HOST=$REDIS_HOST"
    echo "REDIS_PORT=$REDIS_PORT"
    echo "REDIS_PASSWORD=$REDIS_PASSWORD"
    echo ""
    
    echo "📋 Copy these to your Railway/Render environment variables."
else
    echo ""
    echo "📚 See UPSTASH_SETUP.md for detailed instructions."
fi

