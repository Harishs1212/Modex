# NeoCareSync Backend

Express.js API Gateway for NeoCareSync - High Risk Pregnancy Monitoring System

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up database:
```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed  # Optional: seed sample data
```

4. Run development server:
```bash
npm run dev
```

## API Endpoints

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login and get tokens
- `POST /api/users/refresh` - Refresh access token
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

- `GET /api/doctors` - List doctors
- `GET /api/doctors/:id` - Get doctor details
- `POST /api/doctors` - Create doctor (admin only)
- `PUT /api/doctors/:id/availability` - Update availability

- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment
- `GET /api/appointments/slots` - Get available slots

- `POST /api/risk/predict` - Predict risk from manual input
- `POST /api/risk/predict-from-document` - Predict from document upload
- `GET /api/risk/history/:patientId` - Get prediction history
- `GET /api/risk/trends/:patientId` - Get risk trends

## API Documentation

Swagger docs available at `/api-docs` when server is running.

## Environment Variables

See `.env.example` for required environment variables.

