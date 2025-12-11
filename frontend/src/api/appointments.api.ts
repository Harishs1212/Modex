import { apiClient } from './client'

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  appointmentDate: string
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'MISSED'
  notes?: string
  riskScore?: 'LOW' | 'HIGH'
  patient?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    phone?: string
  }
  doctor?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    doctorProfile?: {
      id: string
      specialization: string
    }
  }
}

export interface CreateAppointmentRequest {
  doctorId: string
  appointmentDate: string
  startTime: string
  notes?: string
}

export interface TimeSlot {
  startTime: string
  endTime: string
}

export const appointmentsApi = {
  getAppointments: async (params?: {
    page?: number
    limit?: number
    patientId?: string
    doctorId?: string
    status?: string
    startDate?: string
    endDate?: string
  }) => {
    const response = await apiClient.get<{
      appointments: Appointment[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }>('/appointments', { params })
    return response.data
  },

  createAppointment: async (data: CreateAppointmentRequest) => {
    const response = await apiClient.post<{ appointment: Appointment }>('/appointments', data)
    return response.data
  },

  updateAppointment: async (id: string, data: Partial<CreateAppointmentRequest & { status?: string }>) => {
    const response = await apiClient.put<{ appointment: Appointment }>(`/appointments/${id}`, data)
    return response.data
  },

  cancelAppointment: async (id: string) => {
    const response = await apiClient.delete<{ appointment: Appointment }>(`/appointments/${id}`)
    return response.data
  },

  getSlots: async (doctorId: string, date: string) => {
    const response = await apiClient.get<{ slots: TimeSlot[] }>('/appointments/slots', {
      params: { doctorId, date },
    })
    return response.data
  },
}

