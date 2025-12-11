import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { doctorsApi, Doctor } from '../api/doctors.api';
import {
  Calendar,
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
} from 'lucide-react';

interface Slot {
  id: string;
  doctorId: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentBookings: number;
  isActive: boolean;
  doctor?: Doctor;
  appointments?: Appointment[];
}

interface Appointment {
  id: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  status: string;
  bookingStatus: string;
  attendanceStatus?: string;
  isPriority: boolean;
  riskScore?: string;
  notes?: string;
  createdAt: string;
}

export default function AdminSlotManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    doctorId: '',
    slotDate: '',
    startTime: '',
    endTime: '',
    maxCapacity: 6,
    isActive: true,
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadDoctors();
  }, []);

  // Load slots on initial mount and when filters change
  useEffect(() => {
    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedDoctor]);

  const loadDoctors = async () => {
    try {
      const data = await doctorsApi.getDoctors();
      setDoctors(data);
    } catch (error) {
      console.error('Failed to load doctors:', error);
    }
  };

  const loadSlots = async () => {
    try {
      setLoading(true);
      const params: any = {
        limit: '100', // Load more slots by default
      };
      if (selectedDate) params.date = selectedDate;
      if (selectedDoctor) params.doctorId = selectedDoctor;

      const response = await apiClient.get('/slots', { params });
      // Handle different response formats
      const slotsData = response.data?.slots || response.data?.data || [];
      setSlots(Array.isArray(slotsData) ? slotsData : []);
    } catch (error: any) {
      console.error('Failed to load slots:', error);
      setSlots([]);
      if (error.response?.data?.message) {
        alert(`Failed to load slots: ${error.response.data.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const slotDate = new Date(formData.slotDate).toISOString();
      await apiClient.post('/slots', {
        ...formData,
        slotDate,
      });
      setShowCreateModal(false);
      setFormData({
        doctorId: '',
        slotDate: '',
        startTime: '',
        endTime: '',
        maxCapacity: 6,
        isActive: true,
      });
      await loadSlots();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create slot');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    try {
      setLoading(true);
      const updateData: any = {};
      if (formData.slotDate) updateData.slotDate = new Date(formData.slotDate).toISOString();
      if (formData.startTime) updateData.startTime = formData.startTime;
      if (formData.endTime) updateData.endTime = formData.endTime;
      if (formData.maxCapacity) updateData.maxCapacity = formData.maxCapacity;

      await apiClient.patch(`/slots/${selectedSlot.id}`, updateData);
      setShowEditModal(false);
      setSelectedSlot(null);
      await loadSlots();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update slot');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this slot? This action cannot be undone.')) return;
    try {
      await apiClient.delete(`/slots/${slotId}`);
      await loadSlots();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete slot');
    }
  };

  const handleViewBookings = async (slotId: string) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/slots/${slotId}/bookings`);
      const slotWithBookings = response.data;
      setSelectedSlot(slotWithBookings.slot as any);
      setShowBookingsModal(true);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (appointmentId: string, status: 'ATTENDED' | 'NOT_ATTENDED') => {
    try {
      await apiClient.patch(`/admin/appointments/${appointmentId}/attendance`, {
        attendanceStatus: status,
      });
      await handleViewBookings(selectedSlot!.id);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update attendance');
    }
  };

  // const handleMovePatient = async (appointmentId: string, newSlotId: string) => {
  //   try {
  //     await apiClient.post('/slots/move-patient', {
  //       appointmentId,
  //       newSlotId,
  //     });
  //     await handleViewBookings(selectedSlot!.id);
  //     await loadSlots();
  //   } catch (error: any) {
  //     alert(error.response?.data?.message || 'Failed to move patient');
  //   }
  // };

  const handleUpdateRiskLevel = async (patientId: string, riskLevel: 'LOW' | 'HIGH') => {
    try {
      await apiClient.patch(`/admin/patients/${patientId}/risk-level`, {
        riskLevel,
      });
      await handleViewBookings(selectedSlot!.id);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update risk level');
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const filteredSlots = slots.filter((slot) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const doctorName = slot.doctor
      ? `${slot.doctor.firstName} ${slot.doctor.lastName}`.toLowerCase()
      : '';
    return doctorName.includes(search) || slot.startTime.includes(search);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Doctor Slots</h1>
            <p className="text-gray-600">Manage and edit doctor slots</p>
          </div>
          <button
            onClick={() => {
              setFormData({
                doctorId: '',
                slotDate: '',
                startTime: '',
                endTime: '',
                maxCapacity: 6,
                isActive: true,
              });
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Create Slot
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor</label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Doctors</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.firstName} {doctor.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search slots..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Slots Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Slots Found</h3>
            <p className="text-gray-600">Create a new slot to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSlots.map((slot) => (
              <div
                key={slot.id}
                className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all ${
                  slot.isActive ? 'border-indigo-200 hover:border-indigo-400' : 'border-gray-200 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(slot.slotDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  {!slot.isActive && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>
                      {slot.currentBookings} / {slot.maxCapacity} booked
                    </span>
                  </div>
                  {slot.doctor && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Dr. {slot.doctor.firstName} {slot.doctor.lastName}
                      </p>
                      <div className="mt-1">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          slot.isActive !== false
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {slot.isActive !== false ? '✓ Active' : '⚠ Inactive'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewBookings(slot.id)}
                    className="flex-1 px-4 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-200 transition-all text-sm"
                  >
                    View Bookings
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSlot(slot);
                      setFormData({
                        doctorId: slot.doctorId,
                        slotDate: slot.slotDate.split('T')[0],
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        maxCapacity: slot.maxCapacity,
                        isActive: slot.isActive !== false,
                      });
                      setShowEditModal(true);
                    }}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                    title="Edit slot"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                    title="Delete slot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Slot</h2>
              <form onSubmit={handleCreateSlot} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor</label>
                  <select
                    required
                    value={formData.doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.firstName} {doctor.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.slotDate}
                    onChange={(e) => setFormData({ ...formData, slotDate: e.target.value })}
                    min={today}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Capacity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="20"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Slot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Slot</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedSlot(null);
                    setFormData({
                      doctorId: '',
                      slotDate: '',
                      startTime: '',
                      endTime: '',
                      maxCapacity: 6,
                      isActive: true,
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleUpdateSlot} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.slotDate}
                    onChange={(e) => setFormData({ ...formData, slotDate: e.target.value })}
                    min={today}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Active Status</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-8">Toggle to activate or deactivate this slot</p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedSlot(null);
                      setFormData({
                        doctorId: '',
                        slotDate: '',
                        startTime: '',
                        endTime: '',
                        maxCapacity: 6,
                        isActive: true,
                      });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Slot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bookings Modal */}
        {showBookingsModal && selectedSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 my-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Slot Bookings</h2>
                  <p className="text-gray-600">
                    {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)} •{' '}
                    {new Date(selectedSlot.slotDate).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowBookingsModal(false);
                    setSelectedSlot(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {selectedSlot.appointments && selectedSlot.appointments.length > 0 ? (
                  selectedSlot.appointments.map((apt: Appointment) => (
                    <div
                      key={apt.id}
                      className={`p-4 rounded-xl border-2 ${
                        apt.isPriority
                          ? 'bg-red-50 border-red-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900">
                              {apt.patient.firstName} {apt.patient.lastName}
                            </h3>
                            {apt.isPriority && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                HIGH RISK
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{apt.patient.email}</p>
                          {apt.patient.phone && (
                            <p className="text-sm text-gray-600">{apt.patient.phone}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              apt.status === 'CONFIRMED'
                                ? 'bg-green-100 text-green-700'
                                : apt.status === 'COMPLETED'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap mb-3">
                        <button
                          onClick={() =>
                            handleMarkAttendance(apt.id, apt.attendanceStatus === 'ATTENDED' ? 'NOT_ATTENDED' : 'ATTENDED')
                          }
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            apt.attendanceStatus === 'ATTENDED'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {apt.attendanceStatus === 'ATTENDED' ? (
                            <CheckCircle2 className="w-4 h-4 inline mr-1" />
                          ) : (
                            <XCircle className="w-4 h-4 inline mr-1" />
                          )}
                          {apt.attendanceStatus === 'ATTENDED' ? 'Attended' : 'Mark Attended'}
                        </button>
                        <button
                          onClick={() => handleUpdateRiskLevel(apt.patient.id, apt.riskScore === 'HIGH' ? 'LOW' : 'HIGH')}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all"
                        >
                          Risk: {apt.riskScore || 'N/A'}
                        </button>
                      </div>

                      {apt.notes && (
                        <p className="text-sm text-gray-600 italic mb-2">Notes: {apt.notes}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-600">No bookings for this slot</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

