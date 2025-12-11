import { useQuery, useQueryClient } from '@tanstack/react-query'
import { appointmentsApi } from '../api/appointments.api'
import { slotsApi } from '../api/slots.api'
import { useAuth } from '../hooks/useAuth'
import { apiClient } from '../api/client'
import { Calendar, Users, Clock, AlertCircle, CheckCircle, Activity, Eye, ToggleLeft, ToggleRight } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState('') // Empty means show all future slots
  const [mySlots, setMySlots] = useState<any[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [updatingSlot, setUpdatingSlot] = useState<string | null>(null)
  
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['doctor-appointments', user?.id],
    queryFn: () => appointmentsApi.getAppointments({ limit: 50 }),
    enabled: !!user?.id,
  })

  // Load doctor's slots
  useEffect(() => {
    if (user?.id) {
      loadMySlots()
    }
  }, [user?.id, selectedDate])

  const loadMySlots = async () => {
    if (!user?.id) return
    try {
      setLoadingSlots(true)
      // Get slots for this doctor using their userId (which is doctorId in slots table)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const params: any = {
        doctorId: user.id,
        limit: '100'
        // Don't filter by isActive - show all slots (active and inactive) so they don't disappear
      }
      
      // If a specific date is selected, filter by that date
      if (selectedDate) {
        params.date = selectedDate
      } else {
        // Otherwise, get slots from today onwards (next 3 months)
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 3)
        params.startDate = today.toISOString().split('T')[0]
        params.endDate = endDate.toISOString().split('T')[0]
      }
      
      const response = await apiClient.get('/slots', { params })
      const slotsData = response.data?.slots || response.data?.data || response.data || []
      
      // Additional client-side filter to ensure we only show future/present slots
      const filteredSlots = Array.isArray(slotsData) ? slotsData.filter((slot: any) => {
        const slotDate = new Date(slot.slotDate)
        slotDate.setHours(0, 0, 0, 0)
        return slotDate >= today
      }) : []
      setMySlots(filteredSlots)
    } catch (error: any) {
      console.error('Failed to load slots:', error)
      console.error('Error response:', error.response?.data)
      setMySlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const todayAppointments = appointments?.appointments?.filter(
    apt => new Date(apt.appointmentDate).toDateString() === new Date().toDateString()
  ) || []

  const highRiskCount = appointments?.appointments?.filter(
    apt => apt.riskScore === 'HIGH'
  ).length || 0

  const upcomingAppointments = appointments?.appointments?.filter(
    apt => new Date(apt.appointmentDate) >= new Date() && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED'
  ).slice(0, 10) || []

  const handleAcceptAppointment = async (appointmentId: string) => {
    try {
      setLoadingAction(appointmentId)
      await appointmentsApi.acceptAppointment(appointmentId)
      // Refresh appointments
      await queryClient.invalidateQueries({ queryKey: ['doctor-appointments', user?.id] })
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Failed to accept appointment')
    } finally {
      setLoadingAction(null)
    }
  }

  const handleDeclineAppointment = async (appointmentId: string) => {
    const reason = prompt('Please provide a reason for declining (optional):')
    if (reason === null) return // User cancelled
    
    try {
      setLoadingAction(appointmentId)
      await appointmentsApi.declineAppointment(appointmentId, reason || undefined)
      // Refresh appointments
      await queryClient.invalidateQueries({ queryKey: ['doctor-appointments', user?.id] })
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Failed to decline appointment')
    } finally {
      setLoadingAction(null)
    }
  }

  const handleViewAppointment = (appointment: any) => {
    // Show appointment details in an alert or modal
    const details = `
Patient: ${appointment.patient?.firstName} ${appointment.patient?.lastName}
Email: ${appointment.patient?.email}
Phone: ${appointment.patient?.phone || 'N/A'}
Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}
Time: ${appointment.startTime} - ${appointment.endTime}
Status: ${appointment.status}
Risk Level: ${appointment.riskScore || 'Not Assessed'}
Notes: ${appointment.notes || 'None'}
    `.trim()
    alert(details)
  }

  const handleToggleSlotStatus = async (slotId: string, currentStatus: boolean) => {
    try {
      setUpdatingSlot(slotId)
      await slotsApi.updateSlot(slotId, { isActive: !currentStatus })
      // Refresh slots
      await loadMySlots()
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Failed to update slot status')
    } finally {
      setUpdatingSlot(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, Dr. {user?.firstName} {user?.lastName}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Appointments Today</p>
              <h3 className="text-2xl font-bold text-gray-900">{todayAppointments.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Users className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Patients</p>
              <h3 className="text-2xl font-bold text-gray-900">{appointments?.pagination?.total || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">High Risk Patients</p>
              <h3 className="text-2xl font-bold text-gray-900">{highRiskCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* My Slots Section */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-500" />
            My Available Slots
          </h3>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate('')}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              All
            </button>
            <span className="text-sm text-gray-500">
              {mySlots.length} slot{mySlots.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingSlots ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  </td>
                </tr>
              ) : mySlots.length > 0 ? (
                mySlots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(slot.slotDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{slot.startTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{slot.endTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{slot.maxCapacity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{slot.currentBookings || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleSlotStatus(slot.id, slot.isActive !== false)}
                        disabled={updatingSlot === slot.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                          slot.isActive !== false ? 'bg-green-500' : 'bg-gray-300'
                        } ${updatingSlot === slot.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        title={slot.isActive !== false ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            slot.isActive !== false ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`ml-3 text-xs font-semibold ${
                        slot.isActive !== false ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {slot.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">No slots available for this date</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Appointments Section */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            Upcoming Appointments
          </h3>
          <span className="text-sm text-gray-500">
            {upcomingAppointments.length} upcoming
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                          {apt.patient?.firstName?.[0]?.toUpperCase() || 'P'}{apt.patient?.lastName?.[0]?.toUpperCase() || ''}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {apt.patient?.firstName} {apt.patient?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{apt.patient?.email}</div>
                          {apt.patient?.phone && (
                            <div className="text-xs text-gray-400">{apt.patient.phone}</div>
                          )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(apt.appointmentDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                    </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                        {apt.startTime} - {apt.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        apt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {apt.riskScore ? (
                      <div className="flex items-center">
                        <span className={`px-3 py-1.5 inline-flex items-center text-xs font-bold rounded-md border-2 ${
                          apt.riskScore === 'HIGH' 
                            ? 'bg-red-50 text-red-800 border-red-400' 
                            : 'bg-green-50 text-green-800 border-green-400'
                        }`}>
                          {apt.riskScore === 'HIGH' ? (
                            <>
                              <AlertCircle className="w-3 h-3 mr-1.5" />
                              High Risk
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1.5" />
                              Normal
                            </>
                          )}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Not Assessed</span>
                    )}
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewAppointment(apt)}
                          className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:text-blue-900 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                          title="View appointment details"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        {apt.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => handleAcceptAppointment(apt.id)}
                              disabled={loadingAction === apt.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-green-600 hover:text-green-900 font-medium hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loadingAction === apt.id ? (
                                <>Loading...</>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  Accept
                                </>
                              )}
                            </button>
                            <button 
                              onClick={() => handleDeclineAppointment(apt.id)}
                              disabled={loadingAction === apt.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:text-red-900 font-medium hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loadingAction === apt.id ? (
                                <>Loading...</>
                              ) : (
                                <>
                                  <AlertCircle className="w-4 h-4" />
                                  Decline
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">No upcoming appointments</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
