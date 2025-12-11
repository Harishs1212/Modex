# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login
3. Create a new project
4. Wait for database to be provisioned (2-3 minutes)

## Step 2: Get Connection String

1. Go to Project Settings → Database
2. Find "Connection string" section
3. Select "URI" tab
4. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password

## Step 3: Update Environment Variables

### For Local Development:
Create `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
ML_SERVICE_URL=http://localhost:8000
JWT_SECRET=your-super-secret-jwt-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### For Docker:
Update `docker-compose.yml` environment variables or use `.env` file.

## Step 4: Run Migrations

```bash
# Option 1: Local (if you have Node.js)
cd backend
npm install
npx prisma migrate deploy

# Option 2: Docker
docker-compose exec backend npx prisma migrate deploy
```

## Step 5: (Optional) Seed Database

```bash
# Local
npx prisma db seed

# Docker
docker-compose exec backend npx prisma db seed
```

## Step 6: Verify Connection

Check if your backend can connect:
```bash
docker-compose logs backend
```

You should see "Server running on port 3000" if successful.

