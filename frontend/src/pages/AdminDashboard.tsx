import { useState, useEffect } from 'react';
import { Users, UserPlus, Calendar, Activity, Clock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalPatients: number;
    monthlyNewPatients: number;
    totalDoctors: number;
    activeDoctors: number;
    pendingDoctors: number;
    totalAppointments: number;
    pendingAppointments: number;
    completedAppointments: number;
    totalRevenue: number;
    totalRiskAssessments: number;
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('/admin/analytics/dashboard');
      setStats(response.data);
    } catch (err: any) {
      console.error('Failed to load dashboard stats:', err);
      setError('Failed to load statistics');
      // Set default values on error
      setStats({
        overview: {
          totalUsers: 0,
          totalPatients: 0,
          monthlyNewPatients: 0,
          totalDoctors: 0,
          activeDoctors: 0,
          pendingDoctors: 0,
          totalAppointments: 0,
          pendingAppointments: 0,
          completedAppointments: 0,
          totalRevenue: 0,
          totalRiskAssessments: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  };


  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const dashboardStats = stats
    ? [
        {
          name: 'Total Users',
          value: formatNumber(stats.overview.totalUsers),
          icon: Users,
          color: 'bg-blue-500',
        },
        {
          name: 'New Patients (Monthly)',
          value: formatNumber(stats.overview.monthlyNewPatients),
          icon: UserPlus,
          color: 'bg-green-500',
        },
        {
          name: 'Appointments',
          value: formatNumber(stats.overview.totalAppointments),
          icon: Calendar,
          color: 'bg-purple-500',
        },
        {
          name: 'Risk Assessments',
          value: formatNumber(stats.overview.totalRiskAssessments),
          icon: Activity,
          color: 'bg-orange-500',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/doctors')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Users className="w-4 h-4 mr-2" />
            Manage Doctors
          </button>
          <button
            onClick={() => navigate('/admin/slots')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Clock className="w-4 h-4 mr-2" />
            Manage Slots
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : error && !stats ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((item) => (
            <div key={item.name} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
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
      )}

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
  );
}
