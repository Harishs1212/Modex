import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import {
  Plus,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Department {
  id: string;
  name: string;
}

// Pregnancy-related specializations
const PREGNANCY_SPECIALIZATIONS = [
  'Obstetrics & Gynecology',
  'Maternal-Fetal Medicine',
  'Perinatology',
  'Reproductive Endocrinology',
  'Neonatology',
  'Prenatal Care',
  'Postpartum Care',
  'High-Risk Pregnancy',
  'Fetal Medicine',
  'Reproductive Health',
  'Pregnancy Counseling',
  'Antenatal Care',
];

interface CreatedSlot {
  id: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentBookings: number;
  isActive: boolean;
  availableSpots?: number;
}

export default function AdminDoctorManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [createdSlots, setCreatedSlots] = useState<CreatedSlot[]>([]);
  const [selectedDoctorForSlots, setSelectedDoctorForSlots] = useState<string>('');
  const [doctorSearchFilter, setDoctorSearchFilter] = useState('');
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);

  const [doctorForm, setDoctorForm] = useState({
    userId: '',
    specialization: '',
    licenseNumber: '',
    yearsOfExperience: '',
    bio: '',
    departmentId: '',
  });

  const [slotForm, setSlotForm] = useState({
    doctorId: '',
    slots: [
      {
        slotDate: '',
        startTime: '',
        endTime: '',
        maxCapacity: 6,
      },
    ],
  });

  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([loadUsers(), loadDepartments()]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUsers = async () => {
    try {
      // Load all users (not just DOCTOR role) so we can create doctor profiles for any user
      const response = await apiClient.get('/admin/users', {
        params: { limit: 100 },
      });
      // Handle different response formats
      const usersData = response.data?.users || response.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load users',
      });
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await apiClient.get('/admin/departments');
      // Handle different response formats
      const deptData = response.data?.departments || response.data || [];
      setDepartments(Array.isArray(deptData) ? deptData : []);
    } catch (error: any) {
      console.error('Failed to load departments:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load departments',
      });
    }
  };

  const loadCreatedSlots = async (doctorUserId: string) => {
    try {
      // The doctorId in the form is the user ID, which is the same as doctorId in slots table
      // Get slots for this doctor using the user ID
      const response = await apiClient.get('/slots', {
        params: { 
          doctorId: doctorUserId, 
          limit: 100
        },
      });
      const slotsData = response.data?.slots || response.data || [];
      // Sort by date and time
      const sortedSlots = Array.isArray(slotsData) 
        ? slotsData.sort((a: any, b: any) => {
            const dateA = new Date(a.slotDate).getTime();
            const dateB = new Date(b.slotDate).getTime();
            if (dateA !== dateB) return dateA - dateB;
            return a.startTime.localeCompare(b.startTime);
          })
        : [];
      setCreatedSlots(sortedSlots);
    } catch (error: any) {
      console.error('Failed to load created slots:', error);
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage(null);
      
      // Prepare the data, converting empty strings to undefined and parsing numbers
      const formData: any = {
        userId: doctorForm.userId?.trim() || undefined,
        specialization: doctorForm.specialization?.trim() || undefined,
        licenseNumber: doctorForm.licenseNumber?.trim() || undefined,
      };
      
      // Optional fields - only include if not empty
      if (doctorForm.bio?.trim()) {
        formData.bio = doctorForm.bio.trim();
      }
      
      if (doctorForm.departmentId?.trim()) {
        formData.departmentId = doctorForm.departmentId.trim();
      }
      
      // Parse yearsOfExperience only if it's a non-empty string
      if (doctorForm.yearsOfExperience && doctorForm.yearsOfExperience.trim() !== '') {
        const parsed = parseInt(doctorForm.yearsOfExperience, 10);
        if (!isNaN(parsed) && parsed > 0) {
          formData.yearsOfExperience = parsed;
        }
      }
      
      // Validate required fields
      if (!formData.userId) {
        setMessage({ type: 'error', text: 'Please select a doctor user' });
        setLoading(false);
        return;
      }
      if (!formData.specialization) {
        setMessage({ type: 'error', text: 'Specialization is required' });
        setLoading(false);
        return;
      }
      if (!formData.licenseNumber) {
        setMessage({ type: 'error', text: 'License number is required' });
        setLoading(false);
        return;
      }
      
      await apiClient.post('/admin/doctors/profile', formData);
      setMessage({ type: 'success', text: 'Doctor profile created successfully!' });
      setShowCreateModal(false);
      setDoctorForm({
        userId: '',
        specialization: '',
        licenseNumber: '',
        yearsOfExperience: '',
        bio: '',
        departmentId: '',
      });
      await loadUsers();
    } catch (error: any) {
      console.error('Error creating doctor profile:', error);
      
      // Handle validation errors with details
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const validationErrors = error.response.data.details
          .map((err: any) => `${err.path}: ${err.message}`)
          .join(', ');
        setMessage({
          type: 'error',
          text: `Validation error: ${validationErrors}`,
        });
      } else {
        const errorMessage = error.response?.data?.error || 
                            error.response?.data?.message || 
                            error.message || 
                            'Failed to create doctor profile';
        setMessage({
          type: 'error',
          text: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = () => {
    setSlotForm({
      ...slotForm,
      slots: [
        ...slotForm.slots,
        {
          slotDate: '',
          startTime: '',
          endTime: '',
          maxCapacity: 6,
        },
      ],
    });
  };

  const handleRemoveSlot = (index: number) => {
    setSlotForm({
      ...slotForm,
      slots: slotForm.slots.filter((_, i) => i !== index),
    });
  };

  const handleSlotChange = (index: number, field: string, value: string | number) => {
    const newSlots = [...slotForm.slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlotForm({ ...slotForm, slots: newSlots });
  };

  const handleSetSlotAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage(null);
      
      // Validate required fields
      if (!slotForm.doctorId || slotForm.doctorId.trim() === '') {
        setMessage({ type: 'error', text: 'Please select a doctor' });
        setLoading(false);
        return;
      }

      if (!slotForm.slots || slotForm.slots.length === 0) {
        setMessage({ type: 'error', text: 'Please add at least one slot' });
        setLoading(false);
        return;
      }

      // Validate and prepare slots
      const validSlots = slotForm.slots
        .filter((slot) => {
          // Filter out empty slots
          return slot.slotDate && slot.startTime && slot.endTime;
        })
        .map((slot) => {
          // Validate date
          const slotDate = new Date(slot.slotDate);
          if (isNaN(slotDate.getTime())) {
            throw new Error(`Invalid date: ${slot.slotDate}`);
          }

          // Normalize time format - HTML time inputs return HH:mm or HH:mm:ss
          // Extract just HH:mm part
          const normalizeTime = (time: string) => {
            // Remove seconds if present (HH:mm:ss -> HH:mm)
            return time.split(':').slice(0, 2).join(':');
          };

          const startTime = normalizeTime(slot.startTime);
          const endTime = normalizeTime(slot.endTime);

          // Validate time format (HH:mm)
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (!timeRegex.test(startTime)) {
            throw new Error(`Invalid start time format: ${slot.startTime}. Use HH:mm format`);
          }
          if (!timeRegex.test(endTime)) {
            throw new Error(`Invalid end time format: ${slot.endTime}. Use HH:mm format`);
          }

          // Ensure maxCapacity is a number
          const maxCapacity = typeof slot.maxCapacity === 'number' 
            ? slot.maxCapacity 
            : parseInt(String(slot.maxCapacity), 10) || 6;

          return {
            slotDate: slotDate.toISOString(),
            startTime: startTime,
            endTime: endTime,
            maxCapacity: Math.max(1, Math.min(20, maxCapacity)), // Clamp between 1 and 20
          };
        });

      if (validSlots.length === 0) {
        setMessage({ type: 'error', text: 'Please fill in all required slot fields' });
        setLoading(false);
        return;
      }

      await apiClient.post('/admin/doctors/slot-availability', {
        doctorId: slotForm.doctorId.trim(),
        slots: validSlots,
      });
      
      // Store the doctor ID to fetch slots
      const doctorId = slotForm.doctorId.trim();
      setSelectedDoctorForSlots(doctorId);
      
      // Fetch and display the created slots
      await loadCreatedSlots(doctorId);
      
      setMessage({ type: 'success', text: `Slot availability set successfully! ${validSlots.length} slot(s) created.` });
      setShowSlotModal(false);
      setSlotForm({
        doctorId: '',
        slots: [
          {
            slotDate: '',
            startTime: '',
            endTime: '',
            maxCapacity: 6,
          },
        ],
      });
    } catch (error: any) {
      console.error('Error setting slot availability:', error);
      
      // Handle validation errors with details
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const validationErrors = error.response.data.details
          .map((err: any) => `${err.path}: ${err.message}`)
          .join(', ');
        setMessage({
          type: 'error',
          text: `Validation error: ${validationErrors}`,
        });
      } else {
        const errorMessage = error.response?.data?.error || 
                            error.response?.data?.message || 
                            error.message || 
                            'Failed to set slot availability';
        setMessage({
          type: 'error',
          text: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Doctor Management</h1>
            <p className="text-gray-600">Create doctor profiles and manage availability</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowSlotModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Calendar className="w-5 h-5" />
              Set Slot Availability
            </button>
            <button
              onClick={() => {
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create Doctor Profile
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
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

        {/* Create Doctor Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Doctor Profile</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreateDoctor} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor Name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Type doctor name or email"
                      value={doctorSearchFilter}
                      onChange={(e) => {
                        setDoctorSearchFilter(e.target.value);
                        setShowDoctorDropdown(true);
                      }}
                      onFocus={() => setShowDoctorDropdown(true)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    {showDoctorDropdown && doctorSearchFilter && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                        {users
                          .filter(user =>
                            `${user.firstName} ${user.lastName}`.toLowerCase().includes(doctorSearchFilter.toLowerCase()) ||
                            user.email.toLowerCase().includes(doctorSearchFilter.toLowerCase())
                          )
                          .map((user) => (
                            <div
                              key={user.id}
                              onClick={() => {
                                setDoctorForm({ ...doctorForm, userId: user.id });
                                setDoctorSearchFilter(`${user.firstName} ${user.lastName}`);
                                setShowDoctorDropdown(false);
                              }}
                              className="px-4 py-2 hover:bg-indigo-50 cursor-pointer border-b border-gray-200"
                            >
                              <div className="font-semibold text-gray-900">{user.firstName} {user.lastName}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          ))}
                        {users.filter(user =>
                          `${user.firstName} ${user.lastName}`.toLowerCase().includes(doctorSearchFilter.toLowerCase()) ||
                          user.email.toLowerCase().includes(doctorSearchFilter.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-2 text-gray-500 text-center">No doctors found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization *</label>
                  <select
                    required
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Specialization</option>
                    {PREGNANCY_SPECIALIZATIONS.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">License Number *</label>
                  <input
                    type="text"
                    required
                    value={doctorForm.licenseNumber}
                    onChange={(e) => setDoctorForm({ ...doctorForm, licenseNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      value={doctorForm.yearsOfExperience}
                      onChange={(e) => setDoctorForm({ ...doctorForm, yearsOfExperience: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                    <select
                      value={doctorForm.departmentId}
                      onChange={(e) => setDoctorForm({ ...doctorForm, departmentId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={doctorForm.bio}
                    onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                    rows={3}
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
                    {loading ? 'Creating...' : 'Create Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Set Slot Availability Modal */}
        {showSlotModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Set Doctor Slot Availability</h2>
                <button
                  onClick={() => setShowSlotModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSetSlotAvailability} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor</label>
                  <select
                    required
                    value={slotForm.doctorId}
                    onChange={(e) => setSlotForm({ ...slotForm, doctorId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Doctor</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-semibold text-gray-700">Time Slots</label>
                    <button
                      type="button"
                      onClick={handleAddSlot}
                      className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                      Add Slot
                    </button>
                  </div>

                  {slotForm.slots.map((slot, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                          <input
                            type="date"
                            required
                            min={today}
                            value={slot.slotDate}
                            onChange={(e) => handleSlotChange(index, 'slotDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Start Time</label>
                          <input
                            type="time"
                            required
                            value={slot.startTime}
                            onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">End Time</label>
                          <input
                            type="time"
                            required
                            value={slot.endTime}
                            onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Capacity</label>
                            <input
                              type="number"
                              required
                              min="1"
                              max="20"
                              value={slot.maxCapacity}
                              onChange={(e) => handleSlotChange(index, 'maxCapacity', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                          {slotForm.slots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSlot(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSlotModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Set Availability'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Created Slots Display */}
        {createdSlots.length > 0 && selectedDoctorForSlots && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Calendar className="w-6 h-6 mr-2 text-indigo-600" />
                  Created Slots
                </h3>
                {(() => {
                  const selectedUser = users.find(u => u.id === selectedDoctorForSlots);
                  return selectedUser && (
                    <p className="text-sm text-gray-600 mt-1">
                      For: {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
                    </p>
                  );
                })()}
              </div>
              <button
                onClick={() => {
                  setCreatedSlots([]);
                  setSelectedDoctorForSlots('');
                }}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100"
              >
                Clear
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {createdSlots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {new Date(slot.slotDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{slot.startTime}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{slot.endTime}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{slot.maxCapacity}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{slot.currentBookings || 0}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {slot.availableSpots || (slot.maxCapacity - (slot.currentBookings || 0))}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          slot.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {slot.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

