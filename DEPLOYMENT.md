# NeoCareSync - Deployment Guide

## 🎯 Production Deployment Architecture

```
┌─────────────┐
│   Vercel    │  Frontend (React)
│  (Static)   │  https://your-app.vercel.app
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Railway/   │  Backend API (Express)
│   Render    │  https://api.your-app.com
└──────┬──────┘
       │
       ├──► Supabase PostgreSQL (Database)
       ├──► Upstash Redis (Cache)
       └──► Railway ML Service (FastAPI)
```

---

## 📦 Step-by-Step Deployment

### 1. Database Setup (Supabase)

1. **Create Project:**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in project details
   - Wait 2-3 minutes for provisioning

2. **Get Connection String:**
   - Settings → Database → Connection string
   - Copy the URI format
   - Replace `[YOUR-PASSWORD]` with your password

3. **Run Migrations:**
   ```bash
   # Set DATABASE_URL
   export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
   
   # Run migrations
   cd backend
   npx prisma migrate deploy
   ```

---

### 2. Redis Setup (Upstash)

1. **Create Database:**
   - Go to [upstash.com](https://upstash.com)
   - Create Redis database
   - Choose region closest to your backend

2. **Get Credentials:**
   - Copy REST URL, Host, Port, Password
   - Save for backend configuration

---

### 3. Backend Deployment (Railway)

1. **Create Railway Account:**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select `backend` folder as root

3. **Configure Environment Variables:**
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
   REDIS_HOST=your-upstash-host.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=your-upstash-password
   ML_SERVICE_URL=https://your-ml-service.railway.app
   JWT_SECRET=generate-strong-random-secret-min-32-chars
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   PORT=3000
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=./uploads
   ```

4. **Configure Build Settings:**
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Root Directory: `backend`

5. **Deploy:**
   - Railway will auto-deploy on push
   - Get your backend URL (e.g., `https://backend-production.up.railway.app`)

---

### 4. ML Service Deployment (Railway)

1. **Create New Service:**
   - In same Railway project, click "New"
   - Select "GitHub Repo"
   - Choose `ml-service` folder

2. **Configure Environment:**
   ```
   PORT=8000
   ```

3. **Configure Build:**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Root Directory: `ml-service`

4. **Deploy:**
   - Get ML service URL
   - Update `ML_SERVICE_URL` in backend environment

---

### 5. Frontend Deployment (Vercel)

1. **Create Vercel Account:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project:**
   - Click "Add New Project"
   - Import your GitHub repository
   - Select `frontend` folder

3. **Configure Environment Variables:**
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```

4. **Configure Build:**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Deploy:**
   - Click "Deploy"
   - Get your frontend URL

---

## 🔄 Update Backend with Frontend URL

After frontend is deployed, update backend CORS:

1. Go to Railway backend service
2. Update environment variable:
   ```
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
3. Redeploy backend

---

## ✅ Post-Deployment Checklist

- [ ] Backend is accessible and healthy
- [ ] ML service responds to `/health` endpoint
- [ ] Frontend loads and connects to backend
- [ ] Database migrations applied successfully
- [ ] Redis connection working
- [ ] API documentation accessible at `/api-docs`
- [ ] User registration works
- [ ] User login works
- [ ] Risk prediction works
- [ ] Document upload works
- [ ] Appointment booking works
- [ ] CORS configured correctly

---

## 🔍 Testing Production

### Test Backend:
```bash
curl https://your-backend.railway.app/health
```

### Test ML Service:
```bash
curl https://your-ml-service.railway.app/health
```

### Test Frontend:
- Visit your Vercel URL
- Try logging in
- Test risk prediction
- Test appointment booking

---

## 📊 Monitoring

### Railway:
- View logs in Railway dashboard
- Monitor resource usage
- Set up alerts

### Vercel:
- View analytics
- Monitor performance
- Check build logs

### Supabase:
- Monitor database usage
- Check connection pool
- View query performance

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] Database password is secure
- [ ] Redis password is set
- [ ] CORS is configured for production domain only
- [ ] Environment variables are not committed to git
- [ ] File upload size limits are set
- [ ] Rate limiting is enabled
- [ ] HTTPS is enabled (automatic on Vercel/Railway)

---

## 🆘 Troubleshooting

### Backend won't start:
- Check environment variables
- Verify database connection
- Check build logs

### ML service errors:
- Verify model file exists
- Check Python dependencies
- Review service logs

### Frontend can't connect:
- Verify VITE_API_URL is correct
- Check CORS settings in backend
- Verify backend is accessible

---

## 📝 Environment Variables Summary

### Backend (Railway):
```
DATABASE_URL, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD,
ML_SERVICE_URL, JWT_SECRET, JWT_ACCESS_EXPIRY, JWT_REFRESH_EXPIRY,
PORT, NODE_ENV, FRONTEND_URL, MAX_FILE_SIZE, UPLOAD_DIR
```

### ML Service (Railway):
```
PORT
```

### Frontend (Vercel):
```
VITE_API_URL
```

---

## 🎉 You're Done!

Your application should now be live and accessible. Share the frontend URL with users!

