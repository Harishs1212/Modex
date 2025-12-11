# NeoCareSync API Documentation

Base URL: `http://localhost:3000/api` (development) or your production URL

All endpoints require authentication via JWT Bearer token unless specified otherwise.

## Authentication

Include the JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Slot Management

### Create Slot

Create a new appointment slot (Admin/Doctor only).

**Endpoint:** `POST /api/slots`

**Request Body:**
```json
{
  "doctorId": "550e8400-e29b-41d4-a716-446655440000",
  "slotDate": "2024-12-15T00:00:00.000Z",
  "startTime": "09:00",
  "endTime": "10:00",
  "maxCapacity": 6
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "doctorId": "550e8400-e29b-41d4-a716-446655440000",
    "slotDate": "2024-12-15T00:00:00.000Z",
    "startTime": "09:00",
    "endTime": "10:00",
    "maxCapacity": 6,
    "currentBookings": 0,
    "isActive": true,
    "version": 1,
    "createdAt": "2024-12-10T10:00:00.000Z",
    "updatedAt": "2024-12-10T10:00:00.000Z"
  }
}
```

### List Slots

Get slots with optional filters (Admin/Doctor/Patient).

**Endpoint:** `GET /api/slots`

**Query Parameters:**
- `doctorId` (optional, UUID): Filter by doctor ID
- `date` (optional, YYYY-MM-DD): Filter by date
- `isActive` (optional, boolean): Filter by active status
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 10)

**Example:** `GET /api/slots?doctorId=550e8400-e29b-41d4-a716-446655440000&date=2024-12-15&isActive=true`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "doctorId": "550e8400-e29b-41d4-a716-446655440000",
      "slotDate": "2024-12-15T00:00:00.000Z",
      "startTime": "09:00",
      "endTime": "10:00",
      "maxCapacity": 6,
      "currentBookings": 2,
      "isActive": true,
      "version": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Get Available Slots (Public)

Get available slots without authentication.

**Endpoint:** `GET /api/slots/available`

**Query Parameters:**
- `doctorId` (required, UUID): Doctor ID
- `date` (required, YYYY-MM-DD): Date in YYYY-MM-DD format

**Example:** `GET /api/slots/available?doctorId=550e8400-e29b-41d4-a716-446655440000&date=2024-12-15`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "startTime": "09:00",
      "endTime": "10:00",
      "availableSpots": 4,
      "maxCapacity": 6
    }
  ]
}
```

### Book Slot

Book an appointment slot (Patient only).

**Endpoint:** `POST /api/slots/book`

**Request Body:**
```json
{
  "slotId": "660e8400-e29b-41d4-a716-446655440000",
  "notes": "First-time visit"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "patientId": "440e8400-e29b-41d4-a716-446655440000",
    "doctorId": "550e8400-e29b-41d4-a716-446655440000",
    "slotId": "660e8400-e29b-41d4-a716-446655440000",
    "appointmentDate": "2024-12-15T00:00:00.000Z",
    "startTime": "09:00",
    "endTime": "10:00",
    "status": "PENDING",
    "bookingStatus": "CONFIRMED",
    "notes": "First-time visit",
    "createdAt": "2024-12-10T10:00:00.000Z"
  },
  "message": "Slot booked successfully"
}
```

**Error Response:** `409 Conflict` (concurrent booking or slot full)
```json
{
  "success": false,
  "message": "Slot is no longer available. Please select another slot."
}
```

### Update Slot

Update slot details (Admin/Doctor only).

**Endpoint:** `PATCH /api/slots/:id`

**Request Body:**
```json
{
  "maxCapacity": 8,
  "isActive": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "maxCapacity": 8,
    "isActive": true,
    "version": 4
  }
}
```

### Delete Slot

Delete a slot (Admin/Doctor only).

**Endpoint:** `DELETE /api/slots/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Slot deleted successfully"
}
```

## Appointment Management

### Get Appointments

Get appointments with optional filters.

**Endpoint:** `GET /api/appointments`

**Query Parameters:**
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 10)
- `patientId` (optional, UUID): Filter by patient ID
- `doctorId` (optional, UUID): Filter by doctor ID
- `status` (optional): Filter by status (PENDING, CONFIRMED, COMPLETED, CANCELLED, MISSED)
- `startDate` (optional, ISO datetime): Filter by start date
- `endDate` (optional, ISO datetime): Filter by end date

**Example:** `GET /api/appointments?doctorId=550e8400-e29b-41d4-a716-446655440000&status=PENDING`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "patientId": "440e8400-e29b-41d4-a716-446655440000",
      "doctorId": "550e8400-e29b-41d4-a716-446655440000",
      "slotId": "660e8400-e29b-41d4-a716-446655440000",
      "appointmentDate": "2024-12-15T00:00:00.000Z",
      "startTime": "09:00",
      "endTime": "10:00",
      "status": "PENDING",
      "bookingStatus": "CONFIRMED",
      "attendanceStatus": "PENDING",
      "notes": "First-time visit",
      "riskScore": null,
      "isPriority": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Get Appointment by ID

Get a single appointment by ID.

**Endpoint:** `GET /api/appointments/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "patientId": "440e8400-e29b-41d4-a716-446655440000",
    "doctorId": "550e8400-e29b-41d4-a716-446655440000",
    "slotId": "660e8400-e29b-41d4-a716-446655440000",
    "appointmentDate": "2024-12-15T00:00:00.000Z",
    "startTime": "09:00",
    "endTime": "10:00",
    "status": "PENDING",
    "bookingStatus": "CONFIRMED",
    "attendanceStatus": "PENDING",
    "notes": "First-time visit",
    "riskScore": null,
    "isPriority": false,
    "createdAt": "2024-12-10T10:00:00.000Z",
    "updatedAt": "2024-12-10T10:00:00.000Z"
  }
}
```

### Update Appointment

Update appointment details.

**Endpoint:** `PATCH /api/appointments/:id`

**Request Body:**
```json
{
  "notes": "Updated notes",
  "status": "CONFIRMED"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "notes": "Updated notes",
    "status": "CONFIRMED",
    "version": 2
  }
}
```

### Accept Appointment

Accept an appointment (Doctor only).

**Endpoint:** `POST /api/appointments/:id/accept`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "status": "CONFIRMED"
  },
  "message": "Appointment accepted"
}
```

### Decline Appointment

Decline an appointment (Doctor only).

**Endpoint:** `POST /api/appointments/:id/decline`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "status": "CANCELLED"
  },
  "message": "Appointment declined"
}
```

### Mark Attendance

Mark patient attendance (Admin only).

**Endpoint:** `PATCH /api/admin/appointments/:appointmentId/attendance`

**Request Body:**
```json
{
  "attendanceStatus": "ATTENDED"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "attendanceStatus": "ATTENDED"
  }
}
```

## Risk Prediction

### Predict Risk (Manual Input)

Submit health data for risk prediction (Doctor/Patient only).

**Endpoint:** `POST /api/risk/predict`

**Request Body:**
```json
{
  "age": 28,
  "systolic_bp": 120,
  "diastolic_bp": 80,
  "blood_sugar": 5.5,
  "body_temp": 98.6,
  "bmi": 24.5,
  "previous_complications": 0,
  "preexisting_diabetes": 0,
  "gestational_diabetes": 0,
  "mental_health": 0,
  "heart_rate": 72
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "patientId": "440e8400-e29b-41d4-a716-446655440000",
    "riskLevel": "LOW",
    "confidence": 0.95,
    "probabilities": {
      "Low": 0.95,
      "High": 0.05
    },
    "explanation": "Patient shows low risk factors based on current health metrics.",
    "createdAt": "2024-12-10T10:00:00.000Z"
  }
}
```

### Predict Risk from Document (OCR)

Upload a document for OCR-based risk prediction (Doctor/Patient only).

**Endpoint:** `POST /api/risk/predict-from-document`

**Content-Type:** `multipart/form-data`

**Request Body:**
- `document` (file): PDF, PNG, or JPG file

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "patientId": "440e8400-e29b-41d4-a716-446655440000",
    "riskLevel": "HIGH",
    "confidence": 0.87,
    "probabilities": {
      "Low": 0.13,
      "High": 0.87
    },
    "explanation": "Patient shows elevated risk factors including high blood pressure and gestational diabetes.",
    "document": {
      "id": "990e8400-e29b-41d4-a716-446655440000",
      "fileName": "medical_report.pdf",
      "fileType": "pdf",
      "extractedFeatures": {
        "age": 32,
        "systolic_bp": 145,
        "diastolic_bp": 95,
        "blood_sugar": 7.2,
        "body_temp": 99.1,
        "bmi": 28.5,
        "previous_complications": 1,
        "preexisting_diabetes": 0,
        "gestational_diabetes": 1,
        "mental_health": 0,
        "heart_rate": 88
      }
    },
    "createdAt": "2024-12-10T10:00:00.000Z"
  }
}
```

**Error Response:** `400 Bad Request` (missing features)
```json
{
  "success": false,
  "message": "Could not extract all required features from document. Please provide manual input."
}
```

### Get Risk History

Get risk prediction history for a patient.

**Endpoint:** `GET /api/risk/history/:patientId?`

**Query Parameters:**
- `page` (optional, number): Page number (default: 1)
- `limit` (optional, number): Items per page (default: 10)

**Note:** If `patientId` is not provided, returns history for the authenticated user.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "riskLevel": "LOW",
      "confidence": 0.95,
      "createdAt": "2024-12-10T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### Get Risk Trends

Get risk trend visualization data.

**Endpoint:** `GET /api/risk/trends/:patientId?`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "date": "2024-12-01",
        "riskLevel": "LOW",
        "confidence": 0.92
      },
      {
        "date": "2024-12-05",
        "riskLevel": "LOW",
        "confidence": 0.94
      },
      {
        "date": "2024-12-10",
        "riskLevel": "HIGH",
        "confidence": 0.87
      }
    ],
    "summary": {
      "totalPredictions": 3,
      "lowRiskCount": 2,
      "highRiskCount": 1,
      "averageConfidence": 0.91
    }
  }
}
```

## Doctor Management

### Get Doctors

Get list of doctors with optional filters.

**Endpoint:** `GET /api/doctors`

**Query Parameters:**
- `specialization` (optional, string): Filter by specialization
- `isAvailable` (optional, boolean): Filter by availability
- `status` (optional): Filter by status (PENDING, APPROVED, REJECTED, SUSPENDED)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "330e8400-e29b-41d4-a716-446655440000",
      "specialization": "Obstetrics & Gynecology",
      "licenseNumber": "MD-12345",
      "yearsOfExperience": 10,
      "bio": "Experienced OB-GYN specialist",
      "isAvailable": true,
      "status": "APPROVED",
      "user": {
        "firstName": "Dr. Jane",
        "lastName": "Smith",
        "email": "jane.smith@neocaresync.com"
      }
    }
  ]
}
```

### Get Available Doctors for Date

Get doctors available on a specific date.

**Endpoint:** `GET /api/doctors/available?date=2024-12-15`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "specialization": "Obstetrics & Gynecology",
      "availableSlots": 5,
      "user": {
        "firstName": "Dr. Jane",
        "lastName": "Smith"
      }
    }
  ]
}
```

## Admin Endpoints

### Dashboard Analytics

Get dashboard analytics (Admin only).

**Endpoint:** `GET /api/admin/analytics/dashboard`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalDoctors": 25,
    "totalPatients": 120,
    "totalAppointments": 450,
    "pendingAppointments": 15,
    "todayAppointments": 8,
    "revenue": {
      "today": 1200.00,
      "month": 45000.00,
      "year": 540000.00
    }
  }
}
```

### Appointment Statistics

Get appointment statistics (Admin only).

**Endpoint:** `GET /api/admin/analytics/appointments`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total": 450,
    "byStatus": {
      "PENDING": 15,
      "CONFIRMED": 200,
      "COMPLETED": 200,
      "CANCELLED": 30,
      "MISSED": 5
    },
    "byMonth": [
      {
        "month": "2024-12",
        "count": 50
      }
    ]
  }
}
```

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "slotId",
      "message": "Invalid slot ID"
    }
  ]
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**409 Conflict**
```json
{
  "success": false,
  "message": "Slot is no longer available. Please select another slot."
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Internal server error"
}
```
