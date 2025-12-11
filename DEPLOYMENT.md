# NeoCareSync Deployment Guide

This guide covers deploying NeoCareSync to production using modern cloud platforms.

## Overview

- **Backend**: Railway or Render
- **Database**: Supabase PostgreSQL
- **Frontend**: Vercel
- **ML Service**: Railway
- **Redis**: Upstash (serverless)

## Prerequisites

- GitHub repository with your code
- Accounts on:
  - Railway (or Render) for backend/ML service
  - Supabase for PostgreSQL
  - Vercel for frontend
  - Upstash for Redis

## 1. Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and API keys

### Step 2: Get Connection String

1. Go to **Settings** → **Database**
2. Copy the **Connection string** (URI format)
3. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Step 3: Run Migrations

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Run migrations
cd backend
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### Step 4: Seed Database (Optional)

```bash
npx prisma db seed
```

## 2. Redis Setup (Upstash)

### Step 1: Create Upstash Redis Database

1. Go to [upstash.com](https://upstash.com) and create a new Redis database
2. Choose **Regional** or **Global** (recommended: Regional for lower latency)
3. Note your Redis endpoint and password

### Step 2: Get Connection Details

- **Host**: `[YOUR-ENDPOINT].upstash.io`
- **Port**: `6379` (or custom port)
- **Password**: Your Redis password

## 3. Backend Deployment (Railway)

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and create a new project
2. Click **New** → **GitHub Repo** and select your repository
3. Select the `backend` folder as the root directory

### Step 2: Configure Environment Variables

Add the following environment variables in Railway:

```env
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Redis
REDIS_HOST=[YOUR-ENDPOINT].upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=[YOUR-REDIS-PASSWORD]

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ML Service
ML_SERVICE_URL=https://[YOUR-ML-SERVICE].railway.app

# Frontend
FRONTEND_URL=https://[YOUR-FRONTEND].vercel.app

# Server
PORT=3000
NODE_ENV=production

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Step 3: Configure Build Settings

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Root Directory**: `backend`

### Step 4: Deploy

1. Railway will automatically detect your `package.json` and deploy
2. Wait for the build to complete
3. Your backend will be available at `https://[YOUR-PROJECT].railway.app`

### Step 5: Run Migrations

After deployment, run migrations:

```bash
# SSH into Railway container or use Railway CLI
railway run npx prisma migrate deploy
```

Or use Railway's web terminal to run:
```bash
npx prisma migrate deploy
```

### Alternative: Deploy to Render

1. Go to [render.com](https://render.com) and create a new **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Node
4. Add the same environment variables as above
5. Deploy

## 4. ML Service Deployment (Railway)

### Step 1: Create Railway Project

1. Create a new service in Railway
2. Select the `ml-service` folder as the root directory

### Step 2: Configure Environment Variables

```env
PORT=8000
```

### Step 3: Configure Build Settings

- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- **Root Directory**: `ml-service`

### Step 4: Deploy

1. Railway will automatically deploy your ML service
2. Note the deployment URL: `https://[YOUR-ML-SERVICE].railway.app`

### Step 5: Update Backend Environment Variable

Update the `ML_SERVICE_URL` in your backend service with the ML service URL.

## 5. Frontend Deployment (Vercel)

### Step 1: Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and create a new project
2. Import your GitHub repository
3. Select the `frontend` folder as the root directory

### Step 2: Configure Build Settings

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Configure Environment Variables

Add the following environment variable:

```env
VITE_API_URL=https://[YOUR-BACKEND].railway.app
```

**Important**: Vite requires the `VITE_` prefix for environment variables to be exposed to the client.

### Step 4: Deploy

1. Click **Deploy**
2. Vercel will build and deploy your frontend
3. Your frontend will be available at `https://[YOUR-PROJECT].vercel.app`

### Step 5: Update Backend CORS

Update the `FRONTEND_URL` environment variable in your backend with your Vercel deployment URL.

## 6. Environment Variables Summary

### Backend (Railway/Render)

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
REDIS_HOST=[ENDPOINT].upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=[PASSWORD]
JWT_SECRET=[MIN-32-CHARACTERS]
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
ML_SERVICE_URL=https://[ML-SERVICE].railway.app
FRONTEND_URL=https://[FRONTEND].vercel.app
PORT=3000
NODE_ENV=production
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Frontend (Vercel)

```env
VITE_API_URL=https://[BACKEND].railway.app
```

### ML Service (Railway)

```env
PORT=8000
```

## 7. Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Backend health check: `https://[BACKEND].railway.app/health`
- [ ] ML service health check: `https://[ML-SERVICE].railway.app/health`
- [ ] Frontend loads correctly
- [ ] API documentation accessible: `https://[BACKEND].railway.app/api-docs`
- [ ] Test user login
- [ ] Test slot booking
- [ ] Test risk prediction
- [ ] Verify Redis connection (check logs)
- [ ] Verify database connection (check logs)
- [ ] CORS configured correctly
- [ ] Environment variables set correctly

## 8. Monitoring & Logs

### Railway

- View logs in Railway dashboard
- Set up alerts for deployment failures
- Monitor resource usage

### Vercel

- View deployment logs in Vercel dashboard
- Monitor function execution times
- Set up analytics

### Supabase

- Monitor database performance in Supabase dashboard
- Set up connection pooling if needed
- Review query performance

### Upstash

- Monitor Redis usage in Upstash dashboard
- Set up alerts for high memory usage
- Review command statistics

## 9. Troubleshooting

### Backend Issues

**Problem**: Backend fails to start
- Check environment variables are set correctly
- Verify database connection string
- Check Redis connection details
- Review build logs for errors

**Problem**: Migrations fail
- Ensure `DATABASE_URL` is correct
- Check database permissions
- Verify Prisma schema is up to date

### Frontend Issues

**Problem**: Frontend can't connect to backend
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Ensure backend is running and accessible

**Problem**: Build fails
- Check Node.js version compatibility
- Review build logs for dependency issues
- Verify all environment variables are set

### ML Service Issues

**Problem**: ML service fails to start
- Check Python version (3.11+)
- Verify all dependencies in `requirements.txt`
- Check port configuration

**Problem**: Backend can't reach ML service
- Verify `ML_SERVICE_URL` is correct
- Check ML service health endpoint
- Review network/firewall settings

## 10. Scaling Considerations

### Database (Supabase)

- Enable connection pooling for high traffic
- Set up read replicas for analytics queries
- Monitor query performance and optimize

### Redis (Upstash)

- Upgrade to higher tier for more memory
- Use Redis Cluster for high availability
- Monitor memory usage and optimize caching

### Backend (Railway/Render)

- Scale horizontally by adding more instances
- Use load balancer for multiple instances
- Monitor CPU and memory usage

### Frontend (Vercel)

- Vercel automatically scales
- Use Edge Functions for better performance
- Enable CDN caching

## 11. Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **JWT Secret**: Use a strong, random secret (min 32 characters)
3. **Database**: Use strong passwords and enable SSL
4. **CORS**: Restrict to your frontend domain only
5. **Rate Limiting**: Already implemented in backend
6. **HTTPS**: All services should use HTTPS (automatic with Railway/Vercel)
7. **File Uploads**: Validate file types and sizes
8. **Input Validation**: All endpoints use Zod validation

## 12. Backup & Recovery

### Database Backups

- Supabase provides automatic daily backups
- Manual backups: Use `pg_dump` or Supabase dashboard

### Redis Backups

- Upstash provides automatic backups
- Export data if needed for migration

### Code Backups

- All code is in Git repository
- Tag releases for easy rollback

## Deployment URLs Example

After deployment, your URLs will look like:

- **Frontend**: `https://neocaresync.vercel.app`
- **Backend**: `https://neocaresync-backend.railway.app`
- **ML Service**: `https://neocaresync-ml.railway.app`
- **API Docs**: `https://neocaresync-backend.railway.app/api-docs`

Update these URLs in your environment variables accordingly.
