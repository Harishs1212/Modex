import { apiClient } from './client';

export interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentBookings: number;
  availableSpots: number;
  isFull: boolean;
  isActive?: boolean;
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    doctorProfile?: {
      specialization: string;
    };
  };
}

export interface SlotBookingResponse {
  success: boolean;
  data: {
    id: string;
    patientId: string;
    doctorId: string;
    slotId: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: string;
    bookingStatus: string;
    isPriority: boolean;
  };
  message: string;
}

export const slotsApi = {
  /**
   * Get available slots for a doctor on a date
   */
  getAvailableSlots: async (doctorId: string, date: string): Promise<Slot[]> => {
    const response = await apiClient.get('/slots/available', {
      params: { doctorId, date },
    });
    return response.data.data;
  },

  /**
   * Book a slot
   */
  bookSlot: async (slotId: string, notes?: string): Promise<SlotBookingResponse> => {
    const response = await apiClient.post('/slots/book', {
      slotId,
      notes,
    });
    return response.data;
  },

  /**
   * Get slot details
   */
  getSlotById: async (slotId: string) => {
    const response = await apiClient.get(`/slots/${slotId}`);
    return response.data.data;
  },

  /**
   * Update slot status
   */
  updateSlot: async (slotId: string, data: { isActive?: boolean }) => {
    const response = await apiClient.patch(`/slots/${slotId}`, data);
    return response.data;
  },
};

