import { apiClient } from './client';

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  doctorProfile?: {
    id: string;
    specialization: string;
    licenseNumber: string;
    yearsOfExperience?: number;
    bio?: string;
    isAvailable: boolean;
  };
}

export interface AvailableDoctor {
  id: string;
  userId: string;
  specialization: string;
  yearsOfExperience?: number;
  bio?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  department?: {
    id: string;
    name: string;
  };
  availableSlots: Array<{
    id: string;
    startTime: string;
    endTime: string;
    availableSpots: number;
    maxCapacity: number;
    currentBookings: number;
    isFull: boolean;
    isActive?: boolean;
  }>;
  totalAvailableSlots: number;
  isActiveOnDate?: boolean; // Whether doctor has at least one active slot on this date
}

export const doctorsApi = {
  /**
   * Get all doctors
   */
  getDoctors: async (): Promise<Doctor[]> => {
    const response = await apiClient.get('/doctors');
    return response.data.doctors || response.data;
  },

  /**
   * Get available doctors for a specific date
   */
  getAvailableDoctorsForDate: async (date: string): Promise<AvailableDoctor[]> => {
    const response = await apiClient.get('/doctors/available', {
      params: { date },
    });
    return response.data.doctors || [];
  },

  /**
   * Get doctor by ID
   */
  getDoctorById: async (doctorId: string): Promise<Doctor> => {
    const response = await apiClient.get(`/doctors/${doctorId}`);
    return response.data;
  },
};

