import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import RiskPrediction from './pages/RiskPrediction'
import SlotBooking from './pages/SlotBooking'
import AdminSlotManagement from './pages/AdminSlotManagement'
import AdminDoctorManagement from './pages/AdminDoctorManagement'

function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode | ((user: { id: string; email: string; role: string; firstName?: string; lastName?: string }) => React.ReactNode); 
  allowedRoles: string[] 
}) {
  const { user, isLoading, loadUser } = useAuth()
  const token = localStorage.getItem('accessToken')

  // If we have a token but no user and not loading, try to load user
  React.useEffect(() => {
    if (token && !user && !isLoading) {
      loadUser()
    }
  }, [token, user, isLoading, loadUser])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Check token first - if token exists but user not loaded yet, wait a bit
  if (token && !user) {
    // Give it a moment for user state to load - this handles the case where
    // we just logged in and navigated, but the new useAuth instance hasn't loaded yet
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user && !token) {
    return <Navigate to="/login" replace />
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  if (!user) {
    return <Navigate to="/login" replace />
}

  // If children is a function, pass user to it, otherwise render normally
  const content = typeof children === 'function' ? children(user) : children
  
  return <Layout>{content}</Layout>
}
  
function ConditionalDashboard({ user }: { user: { role: string } }) {
  switch (user.role) {
    case 'PATIENT':
      return <PatientDashboard />
    case 'DOCTOR':
      return <DoctorDashboard />
    case 'ADMIN':
      return <AdminDashboard />
    default:
      return <Navigate to="/login" replace />
  }
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}>
              {(user) => <ConditionalDashboard user={user} />}
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/risk-prediction"
          element={
            <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN']}>
              <RiskPrediction />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book-slot"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <SlotBooking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/slots"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminSlotManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDoctorManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App

