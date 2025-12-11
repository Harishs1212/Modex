# NeoCareSync Demo Video Script

## Video Overview

**Duration**: 10-15 minutes  
**Target Audience**: Technical evaluators, stakeholders, developers

## Introduction (0:00 - 1:00)

### Script

"Welcome to NeoCareSync, a comprehensive high-risk pregnancy monitoring system with ML-powered risk prediction and smart appointment scheduling. In this demo, I'll walk you through the system architecture, deployment process, and key features including concurrency protection, OCR document processing, and real-time analytics."

### What to Show

- Project title slide: "NeoCareSync — High Risk Pregnancy Monitoring System"
- Tech stack overview:
  - Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL + Redis
  - Frontend: React + TypeScript + Tailwind CSS + Vite
  - ML Service: FastAPI + Python + scikit-learn

## System Architecture Overview (1:00 - 2:30)

### Script

"NeoCareSync follows a three-tier architecture. The React frontend communicates with our Express backend API gateway, which orchestrates requests to our PostgreSQL database, Redis cache, and FastAPI ML service. This microservices approach ensures scalability and separation of concerns."

### What to Show

1. **Architecture Diagram** (from SYSTEM_DESIGN.md)
   - Show Mermaid diagram or draw on whiteboard
   - Highlight: Frontend → Backend → ML Service
   - Highlight: PostgreSQL and Redis connections

2. **Key Components**
   - Frontend: React SPA with Vite
   - Backend: Express API with Prisma ORM
   - ML Service: FastAPI with scikit-learn model
   - Database: Supabase PostgreSQL
   - Cache: Upstash Redis

## Backend Deployment (2:30 - 4:00)

### Script

"Let me show you how we deployed the backend to Railway. First, I connected my GitHub repository and selected the backend folder. I configured the build command as 'npm run build' and start command as 'npm start'. Then I added all the required environment variables including the Supabase database URL, Upstash Redis credentials, JWT secret, and ML service URL."

### What to Show

1. **Railway Dashboard**
   - Show project creation
   - Show GitHub repository connection
   - Show build settings:
     - Build Command: `npm run build`
     - Start Command: `npm start`
     - Root Directory: `backend`

2. **Environment Variables**
   - Show environment variables panel
   - Highlight key variables:
     - `DATABASE_URL`
     - `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
     - `JWT_SECRET`
     - `ML_SERVICE_URL`
     - `FRONTEND_URL`

3. **Deployment Logs**
   - Show successful build logs
   - Show deployment URL: `https://[project].railway.app`
   - Show health check: `/health` endpoint

4. **Database Migrations**
   - Show running migrations: `npx prisma migrate deploy`
   - Show successful migration completion

## Frontend Deployment (4:00 - 5:00)

### Script

"For the frontend, we deployed to Vercel, which provides excellent performance and automatic scaling. I connected the repository, set the root directory to 'frontend', configured the build command as 'npm run build' with output directory 'dist', and set the VITE_API_URL environment variable to point to our backend."

### What to Show

1. **Vercel Dashboard**
   - Show project import from GitHub
   - Show framework detection: Vite
   - Show build settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

2. **Environment Variables**
   - Show `VITE_API_URL` variable
   - Explain Vite's environment variable prefix requirement

3. **Deployment**
   - Show successful deployment
   - Show deployment URL: `https://[project].vercel.app`
   - Show live frontend loading

## Database Setup (5:00 - 5:30)

### Script

"We're using Supabase for our PostgreSQL database. After creating the project, I copied the connection string and ran Prisma migrations to set up all our tables including users, doctors, slots, appointments, risk predictions, and medical records."

### What to Show

1. **Supabase Dashboard**
   - Show project creation
   - Show database connection string (masked)
   - Show database tables in Supabase UI

2. **Schema Overview**
   - Show key tables: users, doctors, slots, appointments, risk_predictions
   - Highlight relationships and indexes

## Booking Demo (5:30 - 7:00)

### Script

"Now let's see the booking system in action. As a patient, I'll browse available slots, select a doctor and date, and book an appointment. Notice how the system prevents double-booking using Redis distributed locks and Prisma transactions."

### What to Show

1. **Patient Login**
   - Show login page
   - Login as patient user
   - Show patient dashboard

2. **Slot Browsing**
   - Navigate to slot booking page
   - Show available doctors
   - Select a doctor and date
   - Show available slots with capacity

3. **Booking Process**
   - Click "Book Slot" on an available slot
   - Show loading state
   - Show success message: "Slot booked successfully"
   - Show appointment in "My Appointments"

4. **Backend Logs** (optional)
   - Show Redis lock acquisition in logs
   - Show Prisma transaction execution
   - Show lock release

## Concurrency Demo (7:00 - 8:30)

### Script

"One of the key features is concurrency protection. Let me demonstrate by having multiple users attempt to book the same slot simultaneously. You'll see that only one booking succeeds, while others receive a conflict error, preventing overbooking."

### What to Show

1. **Setup**
   - Open two browser windows/tabs
   - Login as two different patients
   - Both navigate to the same slot

2. **Simultaneous Booking**
   - Both users click "Book" at the same time
   - Show one succeeds, one fails
   - Show success message for first user
   - Show error message for second user: "Slot is no longer available"

3. **Technical Explanation**
   - Explain Redis distributed lock mechanism
   - Show lock key: `slot:{slotId}:lock`
   - Explain 2-minute expiry
   - Explain optimistic locking with version field

## Admin Dashboard Demo (8:30 - 10:00)

### Script

"As an admin, I can manage doctors, create slots, and view analytics. Let me show you the admin dashboard with doctor management, slot creation, and system analytics."

### What to Show

1. **Admin Login**
   - Login as admin user
   - Show admin dashboard

2. **Doctor Management**
   - Navigate to "Doctor Management"
   - Show list of doctors
   - Create a new doctor:
     - Fill in details (name, email, specialization, license)
     - Submit
     - Show doctor in list

3. **Slot Management**
   - Navigate to "Slot Management"
   - Show existing slots
   - Create a new slot:
     - Select doctor
     - Select date and time
     - Set capacity (e.g., 6)
     - Submit
     - Show slot in list

4. **Analytics Dashboard**
   - Show dashboard analytics:
     - Total users, doctors, patients
     - Total appointments
     - Revenue statistics
     - Appointment status breakdown

## Doctor Dashboard Demo (10:00 - 11:00)

### Script

"Doctors have their own dashboard where they can view appointments, accept or decline requests, and manage their slot availability."

### What to Show

1. **Doctor Login**
   - Login as doctor user
   - Show doctor dashboard

2. **Appointment Management**
   - Show "My Appointments" list
   - Show pending appointments
   - Accept an appointment:
     - Click "Accept"
     - Show status change to "CONFIRMED"
   - Decline an appointment:
     - Click "Decline"
     - Show status change to "CANCELLED"

3. **Slot Availability**
   - Show doctor's slots
   - Show slot capacity and current bookings

## Risk Prediction Demo (11:00 - 13:00)

### Script

"The ML-powered risk prediction is a core feature. Patients can either submit health data manually or upload medical documents for OCR-based feature extraction. Let me demonstrate both methods."

### What to Show

1. **Manual Risk Prediction**
   - Navigate to "Risk Prediction" page
   - Fill in health data form:
     - Age: 28
     - Blood pressure: 120/80
     - Blood sugar: 5.5
     - Body temperature: 98.6
     - BMI: 24.5
     - Other health indicators
   - Click "Predict Risk"
   - Show prediction result:
     - Risk Level: LOW or HIGH
     - Confidence: 0.95
     - Probabilities: { "Low": 0.95, "High": 0.05 }
     - Explanation text

2. **OCR Document Upload**
   - Click "Upload Document" tab
   - Upload a sample medical document (PDF/PNG/JPG)
   - Show upload progress
   - Show OCR processing
   - Show extracted features:
     - Age, BP, blood sugar, etc.
   - Show ML prediction result
   - Show document stored in database

3. **Risk History**
   - Show "Risk History" tab
   - Display previous predictions
   - Show trend visualization (if implemented)

## ML Service Integration (13:00 - 13:30)

### Script

"The ML service runs as a separate FastAPI microservice. When a risk prediction request comes in, the backend forwards the features to the ML service, which uses a trained scikit-learn model to predict risk levels."

### What to Show

1. **ML Service Deployment**
   - Show Railway ML service deployment
   - Show health endpoint: `/health`
   - Show ML service URL

2. **API Call Flow**
   - Show backend making request to ML service
   - Show request payload with features
   - Show ML service response with prediction
   - Explain model inference process

3. **Model Details** (optional)
   - Show model file: `pregnancy_risk_model.pkl`
   - Explain feature engineering
   - Show 11 base features + 5 derived features

## Conclusion (13:30 - 14:00)

### Script

"NeoCareSync is a production-ready system that combines modern web technologies with machine learning to provide comprehensive high-risk pregnancy monitoring. Key highlights include concurrency-protected appointment booking, OCR-based document processing, ML-powered risk prediction, and a scalable microservices architecture. Thank you for watching!"

### What to Show

- Summary slide with key features:
  - ✅ Smart appointment scheduling with concurrency protection
  - ✅ ML-powered risk prediction
  - ✅ OCR document processing
  - ✅ Role-based access control
  - ✅ Real-time analytics
  - ✅ Scalable microservices architecture

- Deployment URLs:
  - Frontend: Vercel
  - Backend: Railway
  - ML Service: Railway
  - Database: Supabase
  - Cache: Upstash

- GitHub repository link
- Documentation links (README, API_DOCS, SYSTEM_DESIGN)

## Tips for Recording

1. **Screen Recording**: Use OBS Studio or similar for high-quality screen capture
2. **Audio**: Use a good microphone for clear narration
3. **Pacing**: Speak clearly and pause between sections
4. **Zoom**: Zoom in on important UI elements and code
5. **Transitions**: Use smooth transitions between sections
6. **Error Handling**: If something fails, explain how to troubleshoot
7. **Code Snippets**: Show relevant code snippets when explaining technical details
8. **Diagrams**: Use Mermaid diagrams or draw on whiteboard for architecture
9. **Multiple Tabs**: Use multiple browser tabs/windows for concurrency demo
10. **Timestamps**: Add timestamps in video description for easy navigation

## Key Points to Emphasize

1. **Concurrency Protection**: This is a critical feature - emphasize the Redis lock + Prisma transaction approach
2. **ML Integration**: Show how OCR extracts features and feeds into ML model
3. **Scalability**: Explain how the microservices architecture enables horizontal scaling
4. **Production Ready**: Emphasize error handling, validation, security, and monitoring
5. **Real-World Use**: Explain how this solves actual healthcare management problems
