# Quick Start: Deploy to Cloud

This is a condensed deployment guide. For detailed instructions, see [DEPLOYMENT_CLOUD.md](./DEPLOYMENT_CLOUD.md).

## 🚀 Quick Deployment Checklist

### 1. Supabase Database (5 minutes)

```bash
# 1. Create project at https://supabase.com
# 2. Get connection string from Settings → Database
# 3. Run migrations:
cd Modex
./scripts/migrate-supabase.sh "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### 2. Upstash Redis (2 minutes)

```bash
# 1. Create database at https://upstash.com
# 2. Copy endpoint and password
# 3. Save for backend configuration
```

### 3. Railway Backend (10 minutes)

```bash
# Option A: Using Railway Dashboard
# 1. Go to https://railway.app
# 2. New Project → GitHub Repo
# 3. Set root directory: backend
# 4. Add environment variables (see ENV_TEMPLATE.md)
# 5. Deploy

# Option B: Using CLI
cd Modex
./scripts/deploy-backend-railway.sh
# Then add environment variables in Railway dashboard
```

**Required Environment Variables:**
- `DATABASE_URL` (from Supabase)
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` (from Upstash)
- `JWT_SECRET` (generate with `openssl rand -base64 32`)
- `ML_SERVICE_URL` (update after step 4)
- `FRONTEND_URL` (update after step 5)
- Others: See ENV_TEMPLATE.md

### 4. Railway ML Service (5 minutes)

```bash
# Option A: Using Railway Dashboard
# 1. In Railway project: + New → GitHub Repo
# 2. Set root directory: ml-service
# 3. Add PORT=8000
# 4. Deploy

# Option B: Using CLI
cd Modex
./scripts/deploy-ml-railway.sh
```

**After deployment:**
- Copy ML service URL
- Update `ML_SERVICE_URL` in backend environment variables

### 5. Vercel Frontend (5 minutes)

```bash
# 1. Go to https://vercel.com
# 2. Import GitHub repository
# 3. Set root directory: frontend
# 4. Add environment variable:
#    VITE_API_URL=https://[YOUR-BACKEND].railway.app
# 5. Deploy
```

**After deployment:**
- Copy frontend URL
- Update `FRONTEND_URL` in backend environment variables

## ✅ Verify Deployment

```bash
# Test endpoints
curl https://[YOUR-BACKEND].railway.app/health
curl https://[YOUR-ML-SERVICE].railway.app/health

# Visit frontend
open https://[YOUR-FRONTEND].vercel.app
```

## 📋 Environment Variables Quick Reference

### Backend (Railway)
- `DATABASE_URL` - Supabase connection string
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` - Upstash credentials
- `JWT_SECRET` - Random 32+ char string
- `ML_SERVICE_URL` - ML service URL
- `FRONTEND_URL` - Frontend URL
- `PORT=3000`, `NODE_ENV=production`

### Frontend (Vercel)
- `VITE_API_URL` - Backend URL

### ML Service (Railway)
- `PORT=8000`

## 🐛 Common Issues

**Backend won't start:**
- Check all environment variables are set
- Verify database connection string
- Check Railway logs

**Frontend can't connect:**
- Verify `VITE_API_URL` is set correctly
- Check backend CORS settings
- Ensure backend is running

**Migrations fail:**
- Verify `DATABASE_URL` is correct
- Run migrations via Railway shell: `npx prisma migrate deploy`

## 📚 Full Documentation

- **Detailed Guide**: [DEPLOYMENT_CLOUD.md](./DEPLOYMENT_CLOUD.md)
- **Environment Variables**: [ENV_TEMPLATE.md](./ENV_TEMPLATE.md)
- **Original Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🎉 Done!

Your app should now be live at:
- Frontend: `https://[YOUR-FRONTEND].vercel.app`
- Backend: `https://[YOUR-BACKEND].railway.app`
- API Docs: `https://[YOUR-BACKEND].railway.app/api-docs`

