# NeoCareSync — High Risk Pregnancy Monitoring System with Smart Appointment Scheduling

A comprehensive full-stack healthcare application designed for monitoring high-risk pregnancies with ML-powered risk prediction, intelligent appointment scheduling, and OCR-based document processing.

## Project Overview

NeoCareSync is a production-ready healthcare management system that combines advanced machine learning capabilities with a robust appointment scheduling engine. The system helps healthcare providers identify high-risk pregnancies early through predictive analytics and ensures efficient appointment management with concurrency protection.

### Key Capabilities

- **ML-Powered Risk Prediction**: Uses scikit-learn models to predict pregnancy risk levels (Low/High) based on 11 base features and 5 derived features
- **Smart Appointment Scheduling**: Redis-backed distributed locking prevents double-booking with 2-minute expiry windows
- **OCR Document Processing**: Extracts medical features from uploaded documents (PDF, PNG, JPG) using Tesseract OCR
- **Role-Based Access Control**: Three-tier access system (Admin, Doctor, Patient) with JWT authentication
- **Real-Time Analytics**: Dashboard analytics for appointments, revenue, and patient trends

## Features

### Admin Features

- **Doctor Management**: Create, approve, reject, or suspend doctor profiles
- **Slot Management**: Create, update, and delete appointment slots with capacity management
- **Analytics Dashboard**: View appointment statistics, revenue reports, and system metrics
- **User Management**: Create and manage users across all roles
- **Attendance Tracking**: Mark patient attendance for appointments
- **Department & Category Management**: Organize doctors and treatments

### Doctor Features

- **Dashboard**: View upcoming appointments, patient history, and slot availability
- **Appointment Management**: Accept, decline, complete, or mark appointments as missed
- **Slot Availability**: Set weekly availability patterns and create custom slots
- **Risk Assessment**: View patient risk predictions and medical records
- **Prescription Management**: Create and manage patient prescriptions

### Patient Features

- **Slot Booking**: Browse available slots by doctor and date, book appointments with concurrency protection
- **Risk Prediction**: Submit manual health data or upload documents for OCR-based risk assessment
- **Document Upload**: Upload medical documents (PDF, PNG, JPG) for automated feature extraction
- **Appointment History**: View past and upcoming appointments with status tracking
- **Medical Records**: Access consultation notes, lab results, and treatment plans

## Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Cache**: Redis (Upstash)
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React Query
- **HTTP Client**: Axios

### ML Service
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **ML Library**: scikit-learn
- **OCR**: Tesseract OCR
- **Server**: Uvicorn

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database**: Supabase PostgreSQL (serverless)
- **Cache**: Upstash Redis (serverless)
- **Deployment**: Railway (backend/ML), Vercel (frontend)

## How to Run Locally

### Option 1: Docker Compose (Recommended)

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

### Option 2: Local Development (without Docker)

#### Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

#### ML Service Setup

```bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/neocaresync?schema=public

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ML Service
ML_SERVICE_URL=http://localhost:8000

# Frontend
FRONTEND_URL=http://localhost:5173

# Server
PORT=3000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
```

### ML Service (.env)

```env
PORT=8000
```

## Folder Structure

```
Modex/
├── backend/              # Express.js API Gateway
│   ├── prisma/          # Database schema and migrations
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── middleware/  # Auth, validation, error handling
│   │   ├── modules/     # Feature modules (admin, appointments, slots, risk, etc.)
│   │   └── utils/       # Utilities (logger, redis client, ML client)
│   └── Dockerfile
│
├── frontend/            # React TypeScript Frontend
│   ├── src/
│   │   ├── api/         # API client functions
│   │   ├── components/ # Reusable components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Page components
│   │   └── styles/      # Global styles
│   └── Dockerfile
│
├── ml-service/          # FastAPI ML Microservice
│   ├── app/
│   │   ├── models/      # ML model predictor
│   │   └── utils/       # Feature engineering
│   ├── pregnancy_risk_model.pkl
│   └── Dockerfile
│
└── docker-compose.yml   # Docker Compose configuration
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

## API Documentation

Interactive Swagger documentation is available at `/api-docs` when the backend is running.

For detailed API documentation, see [API_DOCS.md](./API_DOCS.md).

## Additional Documentation

- **[SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)** - Architecture, data flow, and scaling plans
- **[API_DOCS.md](./API_DOCS.md)** - Complete API endpoint documentation
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[VIDEO_SCRIPT.md](./VIDEO_SCRIPT.md)** - Demo video script and walkthrough

## License

ISC
