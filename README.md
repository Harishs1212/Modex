# NeoCareSync - High Risk Pregnancy Monitoring System

A complete full-stack application for high-risk pregnancy monitoring with ML-powered risk prediction, smart appointment scheduling, and document-based OCR feature extraction.

## Architecture

- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL + Redis
- **Frontend**: React + TypeScript + Tailwind CSS + React Query
- **ML Service**: FastAPI + Python + scikit-learn
- **Database**: PostgreSQL (Supabase)
- **Cache**: Redis (Upstash)
- **Containerization**: Docker + Docker Compose

## Features

- User authentication with JWT (access + refresh tokens)
- Role-based access control (Patient, Doctor, Admin)
- Appointment scheduling with concurrency protection
- ML-powered risk prediction (Low/High)
- OCR-based document feature extraction
- Risk trend visualization
- Redis caching for performance
- Swagger API documentation

## Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for local ML service development)

## 🚀 Quick Start

### Option 1: Local Development (Docker)

1. **Start all services:**
   ```bash
   docker-compose up -d --build
   ```

2. **Run database migrations:**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

3. **Seed database (optional):**
   ```bash
   docker-compose exec backend npx prisma db seed
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Docs: http://localhost:3000/api-docs
   - ML Service: http://localhost:8000

5. **Test login:**
   - Email: `admin@neocaresync.com`
   - Password: `admin123`

### Option 2: Production Setup (Supabase)

See [SETUP.md](SETUP.md) for detailed instructions on setting up with Supabase cloud database.

For deployment guide, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Local Development (without Docker)

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### ML Service

```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Documentation

Swagger documentation is available at `/api-docs` when the backend is running.

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Complete setup guide (local & Supabase)
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide

## Deployment

### Backend (Railway/Render)

1. Set environment variables:
   - `DATABASE_URL`
   - `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
   - `ML_SERVICE_URL`
   - `JWT_SECRET`
   - `FRONTEND_URL`

2. Build command: `npm run build`
3. Start command: `npm start`

### Frontend (Vercel)

1. Set environment variable: `VITE_API_URL`
2. Build command: `npm run build`
3. Output directory: `dist`

### ML Service (Railway)

1. Build command: `pip install -r requirements.txt`
2. Start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

### Database

- Use Supabase PostgreSQL (serverless)
- Run migrations: `npx prisma migrate deploy`

### Redis

- Use Upstash Redis (serverless)
- Configure connection in backend environment variables

## Project Structure

```
Modex/
├── backend/          # Express.js API Gateway
├── frontend/         # React TypeScript Frontend
├── ml-service/       # FastAPI ML Microservice
└── docker-compose.yml
```

## Key Features Implementation

### Concurrency Protection

Appointments use Redis distributed locks and Prisma transactions to prevent double-booking:
- 2-minute lock expiry
- Optimistic locking with version field
- Atomic slot reservation

### OCR Integration

Document upload → Tesseract OCR → Feature extraction → ML prediction:
- Supports PDF, PNG, JPG
- Regex-based feature extraction
- Validates all required features before prediction

### Redis Caching

- Risk predictions: 1 hour TTL
- Appointment locks: 2 minutes TTL
- Available slots: 5 minutes TTL

## 📄 Documentation Files

- **[QUICK_START.md](QUICK_START.md)** - Get started in 5 minutes
- **[SETUP.md](SETUP.md)** - Complete setup guide (local & Supabase)
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[TECHNICAL_WRITEUP.md](TECHNICAL_WRITEUP.md)** - Technical architecture and implementation details
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Project overview and features

## 📊 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:3000/api-docs
- Interactive API documentation with try-it-out feature

## 🎓 Assignment Submission

This project is production-ready and includes:
- ✅ Complete source code
- ✅ Docker configuration for local development
- ✅ Database migrations
- ✅ Comprehensive documentation
- ✅ Deployment guides
- ✅ Technical write-up
- ✅ API documentation

## License

ISC

