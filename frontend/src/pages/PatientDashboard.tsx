import { useQuery } from '@tanstack/react-query'
import { appointmentsApi } from '../api/appointments.api'
import { riskApi } from '../api/risk.api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Activity, Calendar, Clock, AlertTriangle, CheckCircle, FileText, Shield } from 'lucide-react'

export default function PatientDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: appointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentsApi.getAppointments({ limit: 5 }),
  })

  // Only fetch risk history if user is a PATIENT
  const { data: riskHistory } = useQuery({
    queryKey: ['risk-history'],
    queryFn: () => riskApi.getHistory(undefined, 1, 5),
    enabled: user?.role === 'PATIENT', // Only fetch if user is a patient
  })

  const latestRisk = riskHistory?.predictions[0]
  
  // Normalize and map risk level for display
  const normalizeRisk = (risk?: string) => {
    if (!risk) return null
    const normalized = risk.toLowerCase() === 'low' ? 'Low' : 
                       risk.toLowerCase() === 'high' ? 'High' : risk
    return normalized === 'Low' ? 'Normal' : normalized
  }
  
  const displayRiskLevel = normalizeRisk(latestRisk?.risk_level)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Patient Overview</h1>
        {user?.role === 'PATIENT' && (
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/book-slot')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Appointment
            </button>
            <button
              onClick={() => navigate('/risk-prediction')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Activity className="w-4 h-4 mr-2" />
              New Risk Assessment
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Risk Assessment Card - Hospital Style */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl border-2 border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-600" />
                Pregnancy Risk Assessment
              </h3>
              {latestRisk && (
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {new Date(latestRisk.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              )}
            </div>
            
            {latestRisk ? (
              <div className="space-y-4">
                {/* Main Risk Status - Hospital Card Style */}
                <div className={`relative overflow-hidden rounded-xl border-2 shadow-md ${
                  displayRiskLevel === 'High' 
                    ? 'border-red-400 bg-gradient-to-br from-red-50 via-red-100 to-red-50' 
                    : 'border-green-400 bg-gradient-to-br from-green-50 via-green-100 to-green-50'
                }`}>
                  <div className="p-8">
                    <div className="flex items-center justify-center space-x-6">
                      <div className={`p-6 rounded-full shadow-lg ${
                        displayRiskLevel === 'High'
                          ? 'bg-red-600 text-white'
                          : 'bg-green-600 text-white'
                      }`}>
                        {displayRiskLevel === 'High' ? (
                          <AlertTriangle className="w-12 h-12" />
                        ) : (
                          <CheckCircle className="w-12 h-12" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-widest mb-2">Risk Status</p>
                        <h2 className={`text-5xl font-bold ${
                          displayRiskLevel === 'High'
                            ? 'text-red-700'
                            : 'text-green-700'
                        }`}>
                          {displayRiskLevel}
                        </h2>
                        <p className="text-xs text-gray-500 mt-2">Pregnancy Risk Level</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clinical Indicators */}
                {latestRisk.explanation && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center uppercase tracking-wide">
                      <FileText className="w-4 h-4 mr-2 text-gray-500" />
                      Clinical Indicators
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {latestRisk.explanation.split(' | ').map((item, idx) => {
                        const parts = item.split(': ')
                        const label = parts[0] || ''
                        const value = parts.slice(1).join(': ') || item
                        return (
                          <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                            <span className="text-gray-500 text-xs block mb-1 font-medium">{label}</span>
                            <span className="text-gray-900 font-semibold">{value}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Medical Recommendation */}
                <div className={`rounded-lg p-5 border-l-4 ${
                  displayRiskLevel === 'High'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-green-50 border-green-500'
                }`}>
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-3 ${
                      displayRiskLevel === 'High'
                        ? 'bg-red-200 text-red-700'
                        : 'bg-green-200 text-green-700'
                    }`}>
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Medical Recommendation</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {displayRiskLevel === 'High' 
                          ? 'Based on your assessment, immediate consultation with your obstetrician is strongly recommended. Please contact your healthcare provider to schedule an urgent appointment for further evaluation and monitoring.'
                          : 'Your assessment indicates normal risk parameters. Continue with regular prenatal care visits, maintain a balanced diet, stay hydrated, and follow your healthcare provider\'s guidelines. Schedule your next routine appointment as planned.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-1">No Risk Assessment Available</p>
                <p className="text-sm text-gray-500">Complete a risk assessment to view your pregnancy risk status</p>
                <button
                  onClick={() => navigate('/risk-prediction')}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Start Assessment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                Upcoming Appointments
              </h3>
            </div>
            
            <div className="space-y-4">
              {appointments?.appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming appointments</p>
                </div>
              ) : (
                appointments?.appointments.map((apt) => (
                  <div key={apt.id} className="flex items-start p-4 bg-gray-50 rounded-lg transition hover:bg-gray-100">
                    <div className="flex-shrink-0 bg-white p-2 rounded-md border border-gray-200 text-center min-w-[60px]">
                      <span className="block text-xs font-bold text-gray-500 uppercase">
                        {new Date(apt.appointmentDate).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="block text-xl font-bold text-gray-900">
                        {new Date(apt.appointmentDate).getDate()}
                      </span>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {apt.startTime} - {apt.endTime}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{apt.doctor?.doctorProfile?.specialization}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
