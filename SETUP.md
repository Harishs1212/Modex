# NeoCareSync - Complete Setup Guide

## 🚀 Quick Start (Local Development with Docker)

### Prerequisites
- Docker Desktop installed and running
- Git

### Steps

1. **Clone and navigate to project:**
   ```bash
   cd Modex
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d --build
   ```

3. **Wait for services to be healthy** (about 30 seconds):
   ```bash
   docker-compose ps
   ```

4. **Run database migrations:**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

5. **Seed database (optional):**
   ```bash
   docker-compose exec backend npx prisma db seed
   ```

6. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Docs: http://localhost:3000/api-docs
   - ML Service: http://localhost:8000/health

7. **Test login:**
   - Email: `admin@neocaresync.com`
   - Password: `admin123`

---

## ☁️ Production Setup with Supabase

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for database provisioning (2-3 minutes)

### Step 2: Get Database Connection String

1. Go to **Project Settings → Database**
2. Copy the **Connection string** (URI format)
3. Replace `[YOUR-PASSWORD]` with your database password

### Step 3: Setup Redis (Upstash)

1. Go to [upstash.com](https://upstash.com) and create a Redis database
2. Copy the connection details (host, port, password)

### Step 4: Configure Environment Variables

Create `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
REDIS_HOST=your-upstash-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-redis-password
ML_SERVICE_URL=http://your-ml-service-url:8000
JWT_SECRET=generate-a-strong-random-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Step 5: Run Migrations

```bash
# Local
cd backend
npm install
npx prisma migrate deploy

# Or with Docker
docker-compose exec backend npx prisma migrate deploy
```

### Step 6: Deploy Services

#### Backend (Railway/Render)
1. Connect your GitHub repo
2. Set environment variables
3. Build command: `npm run build`
4. Start command: `npm start`

#### ML Service (Railway)
1. Set Python runtime
2. Build: `pip install -r requirements.txt`
3. Start: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

#### Frontend (Vercel)
1. Connect repo
2. Set `VITE_API_URL` environment variable
3. Build command: `npm run build`
4. Output directory: `dist`

---

## 📋 Project Structure

```
Modex/
├── backend/          # Express.js API Gateway
│   ├── src/
│   │   ├── modules/  # Feature modules (users, doctors, appointments, risk)
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── scripts/      # Helper scripts
├── frontend/         # React TypeScript Frontend
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── api/
│       └── hooks/
├── ml-service/       # FastAPI ML Microservice
│   └── app/
│       ├── main.py
│       ├── models/
│       └── utils/
└── docker-compose.yml
```

---

## 🔧 Development Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npx prisma studio    # Open Prisma Studio (DB GUI)
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
```

### ML Service
```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Docker
```bash
docker-compose up -d              # Start all services
docker-compose down                # Stop all services
docker-compose logs -f backend     # View backend logs
docker-compose restart backend    # Restart a service
docker-compose ps                  # Check service status
```

---

## 🗄️ Database Management

### Create Migration
```bash
cd backend
npx prisma migrate dev --name migration_name
```

### Apply Migrations
```bash
npx prisma migrate deploy
```

### Reset Database (⚠️ Deletes all data)
```bash
npx prisma migrate reset
```

### View Database
```bash
npx prisma studio
```

---

## 🔐 Default Login Credentials

After seeding:
- **Admin**: `admin@neocaresync.com` / `admin123`
- **Doctor**: `doctor@neocaresync.com` / `doctor123`
- **Patient**: `patient@neocaresync.com` / `patient123`

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change ports in docker-compose.yml or stop conflicting services
```

### Database Connection Error
- Check DATABASE_URL is correct
- Verify database is accessible
- Check firewall/network settings

### Prisma Migration Errors
```bash
# Reset and re-run migrations
npx prisma migrate reset
npx prisma migrate deploy
```

### ML Service Not Working
- Verify `pregnancy_risk_model.pkl` exists in `ml-service/`
- Check ML service logs: `docker-compose logs ml-service`

---

## 📚 API Documentation

Once backend is running, visit:
- **Swagger UI**: http://localhost:3000/api-docs
- Interactive API documentation with try-it-out feature

---

## 🚢 Deployment Checklist

- [ ] Set up Supabase PostgreSQL database
- [ ] Set up Upstash Redis
- [ ] Configure all environment variables
- [ ] Run database migrations
- [ ] Deploy backend to Railway/Render
- [ ] Deploy ML service to Railway
- [ ] Deploy frontend to Vercel
- [ ] Update CORS settings with production URLs
- [ ] Test all endpoints
- [ ] Verify file uploads work
- [ ] Test OCR functionality
- [ ] Test appointment booking
- [ ] Test risk prediction

---

## 📝 Notes

- All services are containerized for easy deployment
- Database migrations are version-controlled
- Environment variables are used for configuration
- Redis caching improves performance
- OCR uses Tesseract.js for document processing
- ML model is loaded from pickle file

---

## 🆘 Support

For issues or questions:
1. Check logs: `docker-compose logs [service-name]`
2. Verify environment variables
3. Check database connectivity
4. Review API documentation at `/api-docs`

