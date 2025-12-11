import { Users, UserPlus, Calendar, Activity } from 'lucide-react'

export default function AdminDashboard() {
  // In a real app, these would come from an API
  const stats = [
    { name: 'Total Users', value: '1,234', icon: Users, color: 'bg-blue-500' },
    { name: 'New Patients (Monthly)', value: '56', icon: UserPlus, color: 'bg-green-500' },
    { name: 'Appointments', value: '845', icon: Calendar, color: 'bg-purple-500' },
    { name: 'Risk Assessments', value: '3,421', icon: Activity, color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${item.color}`}>
                  <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
                    <dd>
                      <div className="text-lg font-bold text-gray-900">{item.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-3"></div>
              <span className="font-medium text-gray-700">API Gateway</span>
            </div>
            <span className="text-sm text-green-600 font-medium">Operational</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-3"></div>
              <span className="font-medium text-gray-700">ML Service</span>
            </div>
            <span className="text-sm text-green-600 font-medium">Operational</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-3"></div>
              <span className="font-medium text-gray-700">Database (PostgreSQL)</span>
            </div>
            <span className="text-sm text-green-600 font-medium">Operational</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-3"></div>
              <span className="font-medium text-gray-700">Redis Cache</span>
            </div>
            <span className="text-sm text-green-600 font-medium">Operational</span>
          </div>
        </div>
      </div>
    </div>
  )
}
