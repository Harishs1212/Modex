export const USER_ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
} as const;

export const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  MISSED: 'MISSED',
} as const;

export const RISK_LEVEL = {
  LOW: 'LOW',
  HIGH: 'HIGH',
} as const;

export const REDIS_KEYS = {
  riskCache: (patientId: string, timestamp: string) => `risk:${patientId}:${timestamp}`,
  appointmentLock: (doctorId: string, slot: string) => `appointment:lock:${doctorId}:${slot}`,
  appointmentPending: (appointmentId: string) => `appointment:pending:${appointmentId}`,
  slotsCache: (doctorId: string, date: string) => `slots:${doctorId}:${date}`,
} as const;

export const REDIS_TTL = {
  riskCache: 3600, // 1 hour
  appointmentLock: 120, // 2 minutes
  appointmentPending: 120, // 2 minutes
  slotsCache: 300, // 5 minutes
} as const;

export const SLOT_DURATION = 30; // minutes

