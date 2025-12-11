import { useQuery } from '@tanstack/react-query'
import { appointmentsApi } from '../api/appointments.api'
import { Calendar, Users, Clock, AlertCircle, CheckCircle } from 'lucide-react'

export default function DoctorDashboard() {
  const { data: appointments } = useQuery({
    queryKey: ['doctor-appointments'],
    queryFn: () => appointmentsApi.getAppointments({ limit: 10 }),
  })

  const todayAppointments = appointments?.appointments.filter(
    apt => new Date(apt.appointmentDate).toDateString() === new Date().toDateString()
  ) || []

  const highRiskCount = appointments?.appointments.filter(
    apt => apt.riskScore === 'HIGH'
  ).length || 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Doctor Portal</h1>
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

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Recent Appointments</h3>
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
              {appointments?.appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                        {apt.patient?.firstName?.[0]}{apt.patient?.lastName?.[0]}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {apt.patient?.firstName} {apt.patient?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{apt.patient?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(apt.appointmentDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {apt.startTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900 font-medium">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {(!appointments?.appointments || appointments.appointments.length === 0) && (
            <div className="text-center py-10">
              <Calendar className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">No appointments found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
