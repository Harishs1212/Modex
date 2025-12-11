# 🚀 NeoCareSync - Quick Start Guide

## For Local Development (5 minutes)

### Step 1: Start Services
```bash
docker-compose up -d --build
```

### Step 2: Run Migrations
```bash
docker-compose exec backend npx prisma migrate deploy
```

### Step 3: Seed Database (Optional)
```bash
docker-compose exec backend npx prisma db seed
```

### Step 4: Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs

### Step 5: Login
- Email: `admin@neocaresync.com`
- Password: `admin123`

---

## For Production with Supabase (10 minutes)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string from Settings → Database

### Step 2: Create Upstash Redis
1. Go to [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy connection details

### Step 3: Configure Backend
Create `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
REDIS_HOST=your-upstash-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password
JWT_SECRET=your-strong-secret-key
ML_SERVICE_URL=http://your-ml-service-url:8000
FRONTEND_URL=https://your-frontend-url.com
```

### Step 4: Run Migrations
```bash
cd backend
npx prisma migrate deploy
```

### Step 5: Deploy Services
- **Backend**: Deploy to Railway/Render
- **ML Service**: Deploy to Railway
- **Frontend**: Deploy to Vercel

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## Troubleshooting

**Services won't start?**
```bash
docker-compose down
docker-compose up -d --build
```

**Database connection error?**
- Check DATABASE_URL is correct
- Verify database is accessible
- Wait for Supabase to finish provisioning

**Port already in use?**
- Change ports in `docker-compose.yml`
- Or stop conflicting services

---

## Need Help?

- **Full Setup Guide**: See [SETUP.md](SETUP.md)
- **Deployment Guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Technical Details**: See [TECHNICAL_WRITEUP.md](TECHNICAL_WRITEUP.md)

