import prisma from '../../config/database';
import { SLOT_DURATION } from '../../utils/constants';

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

/**
 * Generate time slots between start and end time
 */
export function generateTimeSlots(startTime: string, endTime: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMin < endMin)
  ) {
    const slotStart = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
    
    // Calculate end time
    let slotEndMin = currentMin + SLOT_DURATION;
    let slotEndHour = currentHour;
    
    if (slotEndMin >= 60) {
      slotEndMin -= 60;
      slotEndHour += 1;
    }
    
    const slotEnd = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`;
    
    // Check if slot end time exceeds the end time
    if (slotEndHour > endHour || (slotEndHour === endHour && slotEndMin > endMin)) {
      break;
    }
    
    slots.push({ startTime: slotStart, endTime: slotEnd });
    
    // Move to next slot
    currentMin += SLOT_DURATION;
    if (currentMin >= 60) {
      currentMin -= 60;
      currentHour += 1;
    }
  }

  return slots;
}

/**
 * Get available slots for a doctor on a specific date
 */
export async function getAvailableSlots(
  doctorId: string,
  date: Date
): Promise<TimeSlot[]> {
  // Get doctor availability for the day of week
  const dayOfWeek = date.getDay();
  
  const availability = await prisma.doctorAvailability.findMany({
    where: {
      doctorId,
      dayOfWeek,
    },
  });

  if (availability.length === 0) {
    return [];
  }

  // Get all booked appointments for this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      appointmentDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        not: 'CANCELLED',
      },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  const bookedSlots = new Set(
    bookedAppointments.map((apt) => `${apt.startTime}-${apt.endTime}`)
  );

  // Generate all possible slots from availability
  const allSlots: TimeSlot[] = [];
  
  for (const avail of availability) {
    const slots = generateTimeSlots(avail.startTime, avail.endTime);
    allSlots.push(...slots);
  }

  // Filter out booked slots
  const availableSlots = allSlots.filter(
    (slot) => !bookedSlots.has(`${slot.startTime}-${slot.endTime}`)
  );

  return availableSlots;
}

/**
 * Check if a slot is available
 */
export async function isSlotAvailable(
  doctorId: string,
  date: Date,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const availableSlots = await getAvailableSlots(doctorId, date);
  
  return availableSlots.some(
    (slot) => slot.startTime === startTime && slot.endTime === endTime
  );
}

