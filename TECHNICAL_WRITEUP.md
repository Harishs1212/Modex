# NeoCareSync - Technical Write-Up

## System Architecture

### Overview
NeoCareSync follows a microservices architecture with an API Gateway pattern. The system consists of three main services communicating through well-defined APIs, with a centralized database and caching layer.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │  Mobile App  │  │  Admin Panel │      │
│  │  (React)     │  │   (Future)   │  │   (React)    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │  (Express.js)   │
                    │   Port: 3000    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│  ML Service    │  │   PostgreSQL    │  │     Redis      │
│  (FastAPI)     │  │   (Supabase)    │  │    (Upstash)   │
│  Port: 8000    │  │   Port: 5432    │  │   Port: 6379   │
└────────────────┘  └─────────────────┘  └────────────────┘
```

## Core Components

### 1. API Gateway (Backend)

**Technology**: Node.js + Express + TypeScript

**Responsibilities**:
- Request routing and orchestration
- Authentication and authorization
- Input validation
- Rate limiting
- Error handling
- API documentation

**Key Modules**:

#### Users Module
- Registration and authentication
- JWT token generation and refresh
- Profile management
- Role-based access control

#### Doctors Module
- Doctor profile management
- Availability scheduling
- Specialization tracking

#### Appointments Module
- Slot generation and management
- Booking with concurrency protection
- Status tracking (Pending, Confirmed, Completed, Cancelled, Missed)
- Optimistic locking

#### Risk Module
- Risk prediction orchestration
- Document upload handling
- OCR integration
- Prediction history management

### 2. ML Microservice

**Technology**: FastAPI + Python + scikit-learn

**Responsibilities**:
- Load trained ML model
- Feature engineering
- Risk prediction
- Health monitoring

**Model Details**:
- Algorithm: Random Forest Classifier
- Accuracy: 99.06%
- Features: 16 (11 base + 5 derived)
- Output: Binary classification (Low/High risk)

**Feature Engineering**:
1. **Base Features** (11):
   - Age, Systolic BP, Diastolic BP, Blood Sugar, Body Temperature, BMI
   - Previous Complications, Preexisting Diabetes, Gestational Diabetes, Mental Health, Heart Rate

2. **Derived Features** (5):
   - BP_diff: Systolic - Diastolic
   - BMI_cat: Categorized (Underweight/Normal/Overweight/Obese)
   - High_BP: Binary indicator (≥140/90)
   - High_HR: Binary indicator (≥100 bpm)
   - Risk_Factors: Count of medical conditions

### 3. Frontend Application

**Technology**: React + TypeScript + Tailwind CSS

**Key Features**:
- Responsive design
- Role-based dashboards
- Real-time data with React Query
- Form validation
- Risk visualization

## Appointment Engine Logic

### Slot Generation

The appointment engine generates available time slots based on:

1. **Doctor Availability**: Stored in `DoctorAvailability` table
   - Day of week (0-6, Sunday-Saturday)
   - Start time and end time (HH:mm format)

2. **Slot Duration**: Fixed at 30 minutes

3. **Algorithm**:
   ```typescript
   function generateTimeSlots(startTime, endTime) {
     // Generate 30-minute slots between start and end
     // Returns array of {startTime, endTime} objects
   }
   ```

4. **Availability Check**:
   - Query existing appointments for doctor/date
   - Filter out cancelled appointments
   - Return slots not in booked list

### Concurrency Protection

**Problem**: Multiple users trying to book the same slot simultaneously

**Solution**: Multi-layer protection

#### Layer 1: Redis Distributed Lock
```typescript
const lockKey = `appointment:lock:${doctorId}:${slot}`
const acquired = await RedisClient.acquireLock(lockKey, 120) // 2 min TTL
```

**How it works**:
- Before booking, acquire lock with unique key
- Lock expires after 2 minutes (prevents deadlocks)
- If lock exists, booking request is rejected
- Lock released after booking completes

#### Layer 2: Prisma Transaction
```typescript
await prisma.$transaction(async (tx) => {
  // Check slot availability again
  // Create appointment atomically
  // Update version number
})
```

**How it works**:
- All database operations in single transaction
- ACID guarantees ensure atomicity
- If transaction fails, all changes rolled back

#### Layer 3: Optimistic Locking
```prisma
model Appointment {
  version Int @default(1)
  // ...
}
```

**How it works**:
- Each appointment has version number
- On update, version must match current value
- Version incremented on successful update
- Prevents concurrent modifications

**Flow Diagram**:
```
User Request → Acquire Redis Lock → Check Availability → 
Start Transaction → Double-check Availability → 
Create Appointment → Release Lock → Return Success
```

## Risk Prediction Flow

### Manual Input Flow

```
1. User submits form with 11 base features
   ↓
2. Backend validates input (Zod schema)
   ↓
3. Backend calls ML Service /predict endpoint
   ↓
4. ML Service:
   - Engineers 5 derived features
   - Scales features using StandardScaler
   - Predicts using Random Forest model
   - Returns risk level + confidence
   ↓
5. Backend stores prediction in database
   ↓
6. Backend caches result in Redis (1 hour TTL)
   ↓
7. Response sent to frontend
```

### Document Upload Flow

```
1. User uploads document (PDF/PNG/JPG)
   ↓
2. Backend saves file to storage
   ↓
3. Backend calls Tesseract.js OCR
   ↓
4. Extract text from document
   ↓
5. Parse text using regex patterns:
   - Age: "Age: (\d+)" or "(\d+) years"
   - BP: "BP: (\d+)/(\d+)" or "(\d+)/(\d+) mmHg"
   - Blood Sugar: "BS: (\d+\.?\d*)" or "Glucose: (\d+\.?\d*)"
   - Temperature: "Temp: (\d+\.?\d*)" or "(\d+\.?\d*)°F"
   - BMI: "BMI: (\d+\.?\d*)"
   - Heart Rate: "HR: (\d+)" or "Heart Rate: (\d+)"
   - Binary flags: Keyword matching
   ↓
6. Validate all required features extracted
   ↓
7. If incomplete, return error with missing fields
   ↓
8. If complete, call ML Service
   ↓
9. Store prediction + document metadata
   ↓
10. Return result to frontend
```

## Redis Caching Strategy

### Cache Keys

1. **Risk Predictions**:
   - Key: `risk:{patientId}:{timestamp}`
   - TTL: 3600 seconds (1 hour)
   - Value: JSON stringified prediction result
   - Purpose: Avoid redundant ML service calls

2. **Appointment Locks**:
   - Key: `appointment:lock:{doctorId}:{slot}`
   - TTL: 120 seconds (2 minutes)
   - Value: "locked"
   - Purpose: Prevent concurrent bookings

3. **Pending Appointments**:
   - Key: `appointment:pending:{appointmentId}`
   - TTL: 120 seconds (2 minutes)
   - Value: "pending"
   - Purpose: Track booking state during transaction

4. **Available Slots**:
   - Key: `slots:{doctorId}:{date}`
   - TTL: 300 seconds (5 minutes)
   - Value: JSON array of available slots
   - Purpose: Reduce database queries for slot generation

### Cache Invalidation

- **Risk Cache**: Invalidated after new prediction
- **Slot Cache**: Invalidated when appointment created/cancelled
- **Locks**: Auto-expire after TTL

## Transaction Protection

### Prisma Transactions

All critical operations use Prisma transactions:

```typescript
await prisma.$transaction(async (tx) => {
  // Multiple database operations
  // All succeed or all fail
})
```

**Use Cases**:
1. Appointment creation (check + create atomically)
2. Appointment updates (version check + update)
3. Doctor creation (user role update + doctor profile)

### Error Handling

- **Transaction Rollback**: Automatic on error
- **Retry Logic**: For transient failures
- **Deadlock Detection**: Prisma handles automatically
- **Connection Pooling**: Managed by Prisma

## Scalability Considerations

### Horizontal Scaling

**Backend**:
- Stateless design (JWT tokens)
- Can run multiple instances behind load balancer
- Shared Redis for distributed locks
- Connection pooling for database

**ML Service**:
- Stateless (model loaded per instance)
- Can scale independently
- No shared state required

**Frontend**:
- Static files (CDN-friendly)
- No server-side state

### Database Optimization

1. **Indexes**:
   - Foreign keys indexed
   - Query fields indexed (appointmentDate, status, etc.)
   - Composite indexes for common queries

2. **Connection Pooling**:
   - Supabase provides connection pooling
   - Prisma manages pool size

3. **Query Optimization**:
   - Selective field queries (not `SELECT *`)
   - Pagination for large datasets
   - Eager loading for related data

### Caching Strategy

- **Read-heavy workloads**: Redis caching reduces DB load
- **Write-heavy workloads**: Cache invalidation on writes
- **TTL-based expiration**: Automatic cleanup

### Performance Metrics

- **API Response Time**: < 200ms (cached), < 500ms (uncached)
- **ML Prediction**: < 100ms
- **OCR Processing**: 2-5 seconds (depends on document size)
- **Database Queries**: < 50ms (indexed queries)

## Security Implementation

### Authentication

1. **JWT Tokens**:
   - Access token: 15 minutes expiry
   - Refresh token: 7 days expiry
   - Stored in httpOnly cookies (recommended) or localStorage

2. **Password Security**:
   - bcrypt hashing (10 salt rounds)
   - Never stored in plain text
   - Password validation (min 8 characters)

### Authorization

- Role-based access control (RBAC)
- Middleware checks user role before route access
- Resource-level permissions (users can only access their own data)

### Input Validation

- Zod schemas for all inputs
- Type checking at compile time (TypeScript)
- Runtime validation at API boundary

### Rate Limiting

- 100 requests per minute per IP
- 5 login attempts per 15 minutes
- Prevents brute force attacks

### Data Protection

- SQL injection: Prevented by Prisma (parameterized queries)
- XSS: Input sanitization, React auto-escaping
- CSRF: CORS configuration, SameSite cookies
- File uploads: Size limits, type validation

## Testing Strategy

### Unit Tests
- Service layer functions
- Utility functions
- Feature engineering logic

### Integration Tests
- API endpoints
- Database operations
- ML service communication

### End-to-End Tests
- User workflows
- Appointment booking
- Risk prediction flow

## Monitoring & Logging

### Logging
- Structured logging with timestamps
- Error tracking
- Request/response logging (development only)

### Health Checks
- `/health` endpoint on all services
- Database connectivity check
- Redis connectivity check
- ML service availability check

### Metrics to Monitor
- API response times
- Error rates
- Database query performance
- Cache hit rates
- ML service latency

## Deployment Architecture

### Production Setup

```
┌─────────────────┐
│     Vercel      │  Frontend (CDN)
│  (Static Host)  │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│    Railway      │  Backend API
│  (Node.js)      │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    │         │          │          │
    ▼         ▼          ▼          ▼
┌────────┐ ┌──────┐ ┌────────┐ ┌────────┐
│Supabase│ │Upstash│ │Railway │ │  S3    │
│  PG    │ │ Redis │ │  ML    │ │Storage │
└────────┘ └──────┘ └────────┘ └────────┘
```

### Environment Variables

All sensitive configuration via environment variables:
- Database credentials
- JWT secrets
- API keys
- Service URLs

### CI/CD Pipeline

1. **Code Push** → GitHub
2. **Automated Tests** → GitHub Actions
3. **Build** → Docker images
4. **Deploy** → Railway/Vercel
5. **Health Check** → Verify deployment

## Conclusion

NeoCareSync is a production-ready, scalable healthcare application with:
- Robust concurrency protection
- ML-powered risk assessment
- Automated document processing
- Comprehensive security measures
- Well-documented architecture
- Easy deployment process

The system is designed to handle real-world healthcare scenarios while maintaining high performance, security, and reliability.

