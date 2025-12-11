import { useState, useEffect, useRef } from 'react';
import { slotsApi, Slot } from '../api/slots.api';
import { doctorsApi, AvailableDoctor } from '../api/doctors.api';
import { useAuth } from '../hooks/useAuth';
import { Calendar, Clock, Users, AlertCircle, CheckCircle2, Loader2, Sparkles, Zap } from 'lucide-react';

export default function SlotBooking() {
  const { } = useAuth();
  const [availableDoctors, setAvailableDoctors] = useState<AvailableDoctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<AvailableDoctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [notes, setNotes] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Load available doctors when date is selected
  useEffect(() => {
    if (selectedDate) {
      loadAvailableDoctors();
      // Set up real-time polling every 10 seconds
      pollingIntervalRef.current = setInterval(() => {
        loadAvailableDoctors(true);
        if (selectedDoctor) {
          loadSlots(true);
        }
      }, 10000);
    } else {
      setAvailableDoctors([]);
      setSelectedDoctor(null);
      setSlots([]);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // Load slots when doctor is selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadSlots();
    } else {
      setSlots([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoctor, selectedDate]);

  const loadAvailableDoctors = async (silent = false) => {
    if (!selectedDate) return;
    
    try {
      if (!silent) setLoading(true);
      const data = await doctorsApi.getAvailableDoctorsForDate(selectedDate);
      setAvailableDoctors(data);
      setLastUpdate(new Date());
      
      // If selected doctor is no longer available, clear selection
      if (selectedDoctor && !data.find(d => d.id === selectedDoctor.id)) {
        setSelectedDoctor(null);
        setSlots([]);
      }
    } catch (error: any) {
      if (!silent) {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to load available doctors' });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadSlots = async (silent = false) => {
    if (!selectedDoctor || !selectedDate) return;
    
    try {
      if (!silent) setLoading(true);
      // Use userId (which is the doctorId in slots) not the doctor profile id
      const data = await slotsApi.getAvailableSlots(selectedDoctor.userId, selectedDate);
      setSlots(data);
      setLastUpdate(new Date());
    } catch (error: any) {
      if (!silent) {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to load slots' });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleBookSlot = async (slotId: string) => {
    try {
      setBooking(true);
      setMessage(null);
      await slotsApi.bookSlot(slotId, notes || undefined);
      setMessage({ type: 'success', text: 'Slot booked successfully! You will receive a confirmation shortly.' });
      setNotes('');
      // Reload data immediately
      await loadAvailableDoctors();
      if (selectedDoctor) {
        await loadSlots();
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to book slot. Please try again.',
      });
    } finally {
      setBooking(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedDoctor(null);
    setSlots([]);
  };

  const handleDoctorSelect = (doctor: AvailableDoctor) => {
    setSelectedDoctor(doctor);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">Book Your Appointment</h1>
          </div>
          <p className="text-gray-600 text-lg">Select a date to see available doctors and time slots</p>
          {lastUpdate && (
            <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
              <Zap className="w-4 h-4 text-green-500 animate-pulse" />
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        {/* Date Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Calendar className="w-6 h-6 text-pink-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Step 1: Select Date</h2>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            min={today}
            max={maxDateStr}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-white text-gray-900 text-lg"
          />
          {selectedDate && (
            <div className="mt-4 p-4 bg-pink-50 rounded-xl">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Selected:</span>{' '}
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Available Doctors */}
        {selectedDate && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Step 2: Choose Doctor</h2>
              {availableDoctors.length > 0 && (
                <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                  {availableDoctors.length} {availableDoctors.length === 1 ? 'doctor' : 'doctors'} available
                </span>
              )}
            </div>

            {loading && availableDoctors.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : availableDoctors.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No doctors available on this date. Please try another date.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    onClick={() => handleDoctorSelect(doctor)}
                    className={`p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      selectedDoctor?.userId === doctor.userId
                        ? 'bg-gradient-to-br from-blue-100 to-purple-100 border-blue-400 shadow-lg scale-105'
                        : 'bg-gradient-to-br from-gray-50 to-blue-50 border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Dr. {doctor.user.firstName} {doctor.user.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{doctor.specialization}</p>
                      </div>
                      {selectedDoctor?.userId === doctor.userId && (
                        <CheckCircle2 className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div className="space-y-2">
                      {doctor.yearsOfExperience && (
                        <p className="text-xs text-gray-600">
                          <span className="font-semibold">Experience:</span> {doctor.yearsOfExperience} years
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="font-semibold text-purple-700">
                          {doctor.totalAvailableSlots} {doctor.totalAvailableSlots === 1 ? 'slot' : 'slots'} available
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs mt-2">
                        <span className={`px-2 py-1 rounded-full font-semibold ${
                          doctor.isActiveOnDate 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {doctor.isActiveOnDate ? '✓ Active on this date' : '⚠ Not active on this date'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes Input */}
        {selectedDoctor && selectedDate && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific concerns or information you'd like to share..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={3}
            />
          </div>
        )}

        {/* Slots Grid */}
        {selectedDoctor && selectedDate && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Step 3: Select Time Slot</h2>
              <span className="ml-auto text-sm text-gray-600">
                Dr. {selectedDoctor.user.firstName} {selectedDoctor.user.lastName}
              </span>
            </div>

            {loading && slots.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No available slots for this doctor on this date.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Slot</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Spots</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {slots.map((slot) => {
                      const isSlotActive = slot.isActive !== false;
                      const canBook = !slot.isFull && isSlotActive;
                      
                      return (
                        <tr 
                          key={slot.id} 
                          className={`hover:bg-gray-50 transition-colors ${
                            !isSlotActive || slot.isFull ? 'opacity-60' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-purple-600 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </div>
                                {!isSlotActive && (
                                  <div className="text-xs text-red-600 mt-1">Slot inactive</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Users className="w-4 h-4 mr-2 text-blue-500" />
                              <span className="font-semibold">{slot.availableSpots}</span>
                              <span className="text-gray-500 ml-1">available</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {slot.availableSpots} / {slot.maxCapacity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {!isSlotActive ? (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                Inactive
                              </span>
                            ) : slot.isFull ? (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                FULL
                              </span>
                            ) : (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Available
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {canBook ? (
                              <button
                                onClick={() => handleBookSlot(slot.id)}
                                disabled={booking}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                {booking ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Booking...
                                  </>
                                ) : (
                                  'Book Slot'
                                )}
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm">
                                {!isSlotActive ? 'Slot inactive' : 'Not available'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!selectedDate && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Started</h3>
            <p className="text-gray-600">Please select a date to view available doctors and time slots</p>
          </div>
        )}
      </div>
    </div>
  );
}
