# NeoCareSync Cloud Deployment Guide

Complete step-by-step guide for deploying NeoCareSync to cloud/serverless platforms.

## 🎯 Overview

This guide will help you deploy:
- **Frontend** → Vercel (serverless)
- **Backend** → Railway or Render (serverless)
- **ML Service** → Railway or Render (serverless)
- **Database** → Supabase (serverless PostgreSQL)
- **Cache** → Upstash (serverless Redis)

---

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Accounts on:**
   - [Supabase](https://supabase.com) - Free tier available
   - [Upstash](https://upstash.com) - Free tier available
   - [Railway](https://railway.app) or [Render](https://render.com) - Free tier available
   - [Vercel](https://vercel.com) - Free tier available

3. **Local Tools (Optional but recommended):**
   ```bash
   # Railway CLI
   npm i -g @railway/cli
   railway login
   
   # Vercel CLI
   npm i -g vercel
   vercel login
   ```

---

## 🗄️ Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in:
   - **Name**: `neocaresync` (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient for development

4. Wait for project to be created (~2 minutes)

### 1.2 Get Connection String

1. Go to **Settings** → **Database**
2. Scroll to **"Connection string"** section
3. Select **"URI"** tab
4. Copy the connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your database password

### 1.3 Run Migrations

**Option A: Using Script (Recommended)**
```bash
cd Modex
./scripts/migrate-supabase.sh "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

**Option B: Manual**
```bash
cd Modex/backend
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
npx prisma generate
npx prisma migrate deploy
```

### 1.4 Verify Migration

1. Go to Supabase Dashboard → **Table Editor**
2. You should see all tables: `users`, `doctors`, `slots`, `appointments`, etc.

### 1.5 (Optional) Seed Database

```bash
cd Modex/backend
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
npx prisma db seed
```

---

## 🔴 Step 2: Set Up Upstash Redis

### 2.1 Create Upstash Redis Database

1. Go to [upstash.com](https://upstash.com) and sign up/login
2. Click **"Create Database"**
3. Fill in:
   - **Name**: `neocaresync-redis`
   - **Type**: **Regional** (recommended for lower latency)
   - **Region**: Choose same region as Supabase
   - **Pricing**: Free tier (10K commands/day)

4. Click **"Create"**

### 2.2 Get Connection Details

1. After creation, you'll see the database details:
   - **Endpoint**: `[YOUR-ENDPOINT].upstash.io`
   - **Port**: `6379` (or custom port shown)
   - **Password**: Copy this (shown only once!)

2. Save these values - you'll need them for backend configuration

---

## 🚂 Step 3: Deploy Backend to Railway

### 3.1 Create Railway Project

1. Go to [railway.app](https://railway.app) and sign up/login
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your GitHub account if not already connected
5. Select your repository
6. Railway will detect it's a Node.js project

### 3.2 Configure Backend Service

1. Railway will create a service automatically
2. Click on the service → **Settings**
3. Set **Root Directory** to: `backend`
4. Set **Build Command** to: `npm install && npm run build`
5. Set **Start Command** to: `npm start`

### 3.3 Add Environment Variables

Go to **Variables** tab and add:

```bash
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Redis
REDIS_HOST=[YOUR-ENDPOINT].upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=[YOUR-REDIS-PASSWORD]

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ML Service (will update after deploying ML service)
ML_SERVICE_URL=https://[YOUR-ML-SERVICE].railway.app

# Frontend (will update after deploying frontend)
FRONTEND_URL=https://[YOUR-FRONTEND].vercel.app

# Server
PORT=3000
NODE_ENV=production

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

**Generate JWT_SECRET:**
```bash
# On Linux/Mac
openssl rand -base64 32

# Or use an online generator
```

### 3.4 Deploy

1. Railway will automatically deploy when you push to GitHub
2. Or click **"Deploy"** button
3. Wait for build to complete (~2-3 minutes)

### 3.5 Run Migrations

After deployment, run migrations:

**Option A: Using Railway Dashboard**
1. Go to your service → **Deployments**
2. Click on latest deployment → **View Logs**
3. Click **"Open Shell"**
4. Run:
   ```bash
   npx prisma migrate deploy
   ```

**Option B: Using Railway CLI**
```bash
cd Modex/backend
railway link
railway run npx prisma migrate deploy
```

### 3.6 Get Backend URL

1. Go to service → **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL: `https://[YOUR-BACKEND].railway.app`
4. Test: `https://[YOUR-BACKEND].railway.app/health`

---

## 🤖 Step 4: Deploy ML Service to Railway

### 4.1 Create ML Service

1. In your Railway project, click **"+ New"** → **"GitHub Repo"**
2. Select the same repository
3. Railway will detect Python

### 4.2 Configure ML Service

1. Click on the new service → **Settings**
2. Set **Root Directory** to: `ml-service`
3. Set **Build Command** to: `pip install -r requirements.txt`
4. Set **Start Command** to: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 4.3 Add Environment Variables

Go to **Variables** tab:

```bash
PORT=8000
```

### 4.4 Deploy

1. Railway will auto-deploy
2. Wait for build (~3-5 minutes - Python dependencies take time)

### 4.5 Get ML Service URL

1. Go to service → **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy URL: `https://[YOUR-ML-SERVICE].railway.app`
4. Test: `https://[YOUR-ML-SERVICE].railway.app/health`

### 4.6 Update Backend Environment Variable

1. Go back to Backend service → **Variables**
2. Update `ML_SERVICE_URL` with your ML service URL
3. Railway will automatically redeploy

---

## 🎨 Step 5: Deploy Frontend to Vercel

### 5.1 Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Vercel will detect it's a Vite project

### 5.2 Configure Build Settings

1. **Framework Preset**: Vite (auto-detected)
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build` (auto-detected)
4. **Output Directory**: `dist` (auto-detected)
5. **Install Command**: `npm install` (auto-detected)

### 5.3 Add Environment Variables

Go to **Environment Variables**:

```bash
VITE_API_URL=https://[YOUR-BACKEND].railway.app
```

**Important**: Vite requires `VITE_` prefix for client-side variables!

### 5.4 Deploy

1. Click **"Deploy"**
2. Wait for build (~1-2 minutes)
3. Vercel will provide a URL: `https://[YOUR-PROJECT].vercel.app`

### 5.5 Update Backend CORS

1. Go back to Railway Backend → **Variables**
2. Update `FRONTEND_URL` with your Vercel URL
3. Railway will automatically redeploy

---

## ✅ Step 6: Verify Deployment

### 6.1 Health Checks

```bash
# Backend
curl https://[YOUR-BACKEND].railway.app/health

# ML Service
curl https://[YOUR-ML-SERVICE].railway.app/health

# Frontend (should load)
open https://[YOUR-FRONTEND].vercel.app
```

### 6.2 Test API Documentation

Visit: `https://[YOUR-BACKEND].railway.app/api-docs`

### 6.3 Test Login

1. Go to frontend: `https://[YOUR-FRONTEND].vercel.app`
2. Try logging in with seeded admin:
   - Email: `admin@neocaresync.com`
   - Password: `admin123`

---

## 🔄 Alternative: Deploy to Render

If you prefer Render over Railway:

### Backend on Render

1. Go to [render.com](https://render.com)
2. Create **New Web Service**
3. Connect GitHub repository
4. Configure:
   - **Name**: `neocaresync-backend`
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: `backend`

5. Add all environment variables (same as Railway)
6. Deploy

### ML Service on Render

1. Create **New Web Service**
2. Configure:
   - **Name**: `neocaresync-ml-service`
   - **Environment**: Python 3
   - **Build Command**: `cd ml-service && pip install -r requirements.txt`
   - **Start Command**: `cd ml-service && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `ml-service`

3. Add `PORT=8000` environment variable
4. Deploy

**Note**: You can also use `render.yaml` file in the root directory for automated setup.

---

## 📊 Environment Variables Summary

### Backend (Railway/Render)

```bash
DATABASE_URL=postgresql://...
REDIS_HOST=...
REDIS_PORT=6379
REDIS_PASSWORD=...
JWT_SECRET=...
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
ML_SERVICE_URL=https://...
FRONTEND_URL=https://...
PORT=3000
NODE_ENV=production
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Frontend (Vercel)

```bash
VITE_API_URL=https://...
```

### ML Service (Railway/Render)

```bash
PORT=8000
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Build fails
- Check Node.js version (should be 20+)
- Check build logs in Railway/Render dashboard
- Ensure all dependencies are in `package.json`

**Problem**: Database connection fails
- Verify `DATABASE_URL` is correct
- Check Supabase dashboard → Settings → Database → Connection pooling
- Try using connection pooler URL if available

**Problem**: Redis connection fails
- Verify Redis credentials
- Check Upstash dashboard for endpoint status
- Backend will run without Redis (with degraded performance)

**Problem**: Migrations fail
- Ensure `DATABASE_URL` is set correctly
- Check database permissions in Supabase
- Try running migrations manually via Railway shell

### ML Service Issues

**Problem**: Build fails
- Check Python version (should be 3.11+)
- Verify all model files exist (`pregnancy_risk_model.pkl`, `scaler.pkl`, `label_encoder.pkl`)
- Check build logs for missing dependencies

**Problem**: Model not found
- Ensure model files are in `ml-service/` directory
- Check file paths in `predictor.py`

### Frontend Issues

**Problem**: Can't connect to backend
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Ensure backend is running and accessible

**Problem**: Build fails
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check build logs in Vercel dashboard

---

## 📈 Post-Deployment

### Monitoring

- **Railway**: View logs in dashboard, set up alerts
- **Vercel**: View deployment logs, monitor function execution
- **Supabase**: Monitor database performance, query logs
- **Upstash**: Monitor Redis usage, command statistics

### Scaling

- **Database**: Supabase auto-scales, enable connection pooling for high traffic
- **Redis**: Upgrade Upstash tier if needed
- **Backend**: Railway/Render auto-scales, upgrade plan if needed
- **Frontend**: Vercel auto-scales globally

### Backups

- **Database**: Supabase provides automatic daily backups
- **Redis**: Upstash provides automatic backups
- **Code**: All in GitHub (version control)

---

## 🎉 Success!

Your NeoCareSync application is now fully deployed to the cloud!

**Your URLs:**
- Frontend: `https://[YOUR-FRONTEND].vercel.app`
- Backend: `https://[YOUR-BACKEND].railway.app`
- API Docs: `https://[YOUR-BACKEND].railway.app/api-docs`
- ML Service: `https://[YOUR-ML-SERVICE].railway.app`

**Next Steps:**
1. Test all features
2. Set up custom domains (optional)
3. Configure monitoring and alerts
4. Set up CI/CD for automatic deployments

---

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Upstash Docs](https://docs.upstash.com)
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)

---

**Need Help?** Check the main [DEPLOYMENT.md](./DEPLOYMENT.md) for more details.

