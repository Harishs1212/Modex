import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimit.middleware';

// Routes
import userRoutes from './modules/users/user.routes';
import doctorRoutes from './modules/doctors/doctor.routes';
import appointmentRoutes from './modules/appointments/appointment.routes';
import riskRoutes from './modules/risk/risk.routes';
import adminRoutes from './modules/admin/admin.routes';
import medicalRecordRoutes from './modules/medical-records/medical-record.routes';
import prescriptionRoutes from './modules/prescriptions/prescription.routes';
import paymentRoutes from './modules/payments/payment.routes';
import slotRoutes from './modules/slots/slot.routes';

// Swagger
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();

// Swagger configuration
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NeoCareSync API',
      version: '1.0.0',
      description: 'High Risk Pregnancy Monitoring and Smart Appointment Engine API',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.ts', './src/server.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// CORS Configuration - Allow multiple origins
const allowedOrigins = [
  config.cors.frontendUrl,
  'http://localhost:5173', // Local development
  process.env.FRONTEND_URL, // Production frontend
].filter(Boolean);

// Handle CORS preflight requests (OPTIONS)
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  
  // Check if origin is allowed
  const isAllowed = !origin || allowedOrigins.some(allowed => {
    if (typeof allowed === 'string') {
      return origin === allowed || origin?.includes(allowed.replace('https://', '').replace('http://', ''));
    }
    return false;
  }) || allowedOrigins.length === 0;
  
  if (isAllowed && origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (isAllowed) {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  res.sendStatus(200);
});

// CORS Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed origin
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed || origin?.includes(allowed.replace('https://', '').replace('http://', ''));
      }
      return false;
    });
    
    if (isAllowed || allowedOrigins.length === 0) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/slots', slotRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
});

export default app;

