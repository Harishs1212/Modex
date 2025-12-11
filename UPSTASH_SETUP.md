# Upstash Redis Setup Guide

## ⚠️ Important: Two Types of Upstash Connections

Upstash provides **two types** of Redis connections:

1. **REST API** (for serverless/edge functions) - Uses URL + Token
2. **Redis Protocol** (for traditional Redis clients like ioredis) - Uses Host + Port + Password

## Current Backend Configuration

The backend uses `ioredis` which requires **Redis Protocol** connection details.

**You've provided REST API credentials, but we need Redis Protocol credentials!**

## ✅ Quick Setup (5 minutes)

### Step 1: Get Redis Protocol Connection Details

1. Go to: **[https://console.upstash.com/redis/striking-redfish-10121](https://console.upstash.com/redis/striking-redfish-10121)**
2. Click on the **"Redis"** tab (NOT "REST API" tab)
3. You'll see:
   - **Endpoint**: `striking-redfish-10121.upstash.io` (or similar)
   - **Port**: `6379` (or custom port shown)
   - **Password**: Click **"Show"** to reveal password

### Step 2: Use Helper Script (Optional)

```bash
cd Modex
./scripts/setup-upstash-redis.sh
```

### Step 3: Set Environment Variables in Railway/Render

Add these to your backend service environment variables:

```bash
REDIS_HOST=striking-redfish-10121.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=[YOUR-PASSWORD-FROM-REDIS-TAB]
```

**⚠️ Important**: The password from the **"Redis"** tab is **DIFFERENT** from the REST token you provided!

## 📋 Your Current Credentials

**REST API (provided, but not used by current setup):**
- REST URL: `https://striking-redfish-10121.upstash.io`
- REST Token: `ASeJAAIncDE2MTMxZjc0ZDI5NDk0MDE2OTFmZjI2NDE2NDQxOWQ5MXAxMTAxMjE`

**Redis Protocol (needed, get from dashboard):**
- Host: `striking-redfish-10121.upstash.io` (likely same)
- Port: `6379` (or custom port)
- Password: **[Get from Redis tab in dashboard]**

## 🔍 Visual Guide

In Upstash Dashboard:
1. Select your database
2. You'll see tabs: **"Details"**, **"Redis"**, **"REST API"**
3. Click **"Redis"** tab (not REST API!)
4. Copy the connection details

## 🚀 Alternative: Use REST API (Requires Code Changes)

If you prefer to use REST API, you'll need to:

1. Install `@upstash/redis` package:
   ```bash
   cd backend
   npm install @upstash/redis
   ```

2. Update `backend/src/config/redis.ts` to use `@upstash/redis`
3. Use REST URL and Token instead

**However, using Redis Protocol is recommended** since the code is already set up for it.

## ✅ Verification

After setting environment variables, test the connection:

```bash
# In Railway/Render shell or locally
cd backend
node -e "
const Redis = require('ioredis');
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});
redis.ping().then(r => console.log('✅ Redis connected:', r)).catch(e => console.error('❌ Error:', e));
"
```

## 📚 Additional Resources

- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [ioredis Documentation](https://github.com/redis/ioredis)

