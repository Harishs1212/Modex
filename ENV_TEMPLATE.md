# Environment Variables Template

Copy these templates and fill in your actual values.

## Backend Environment Variables

Create these in Railway/Render dashboard:

```bash
# Database (Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Redis (Upstash)
# Option 1: Traditional Redis Protocol (for ioredis - CURRENT SETUP)
REDIS_HOST=striking-redfish-10121.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=[GET-FROM-UPSTASH-DASHBOARD-REDIS-TAB]

# Option 2: REST API (requires code changes to use @upstash/redis)
# UPSTASH_REDIS_REST_URL=https://striking-redfish-10121.upstash.io
# UPSTASH_REDIS_REST_TOKEN=ASeJAAIncDE2MTMxZjc0ZDI5NDk0MDE2OTFmZjI2NDE2NDQxOWQ5MXAxMTAxMjE

# JWT Authentication
JWT_SECRET=[GENERATE-A-STRONG-32-CHAR-SECRET]
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ML Service URL (update after deploying ML service)
ML_SERVICE_URL=https://[YOUR-ML-SERVICE].railway.app

# Frontend URL (update after deploying frontend)
FRONTEND_URL=https://[YOUR-FRONTEND].vercel.app

# Server Configuration
PORT=3000
NODE_ENV=production

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

## Frontend Environment Variables

Create these in Vercel dashboard:

```bash
# Backend API URL
VITE_API_URL=https://[YOUR-BACKEND].railway.app
```

## ML Service Environment Variables

Create these in Railway/Render dashboard:

```bash
# Server Port
PORT=8000
```

## How to Generate JWT_SECRET

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Online:**
- Use a secure random string generator
- Minimum 32 characters recommended

## Connection String Formats

### Supabase Database URL
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### Upstash Redis
- **Host**: `[YOUR-ENDPOINT].upstash.io`
- **Port**: `6379` (or custom port)
- **Password**: From Upstash dashboard

## Important Notes

1. **Never commit `.env` files to Git** - These are secrets!
2. **Vite requires `VITE_` prefix** for frontend environment variables
3. **Update URLs** after each service is deployed
4. **Test connections** after setting up each service

