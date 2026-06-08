import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../pages/shared/LoginPage'
import RegisterPage from '../pages/shared/RegisterPage'
import OnboardingPage from '../pages/shared/OnboardingPage'
import CandidateDashboard from '../pages/candidate/CandidateDashboard'
import ProfileSettings from '../pages/candidate/ProfileSettings'
import EmployerDashboard from '../pages/employer/EmployerDashboard'
import AdminStats from '../pages/admin/AdminStats'
import ProtectedRoute from './ProtectedRoute'
import RoleGuard from './RoleGuard'

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/candidate"
        element={
          <ProtectedRoute>
            <RoleGuard roles={['CANDIDATE']}>
              <CandidateDashboard />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <RoleGuard roles={['CANDIDATE']}>
              <ProfileSettings />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/employer"
        element={
          <ProtectedRoute>
            <RoleGuard roles={['EMPLOYER']}>
              <EmployerDashboard />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute>
            <RoleGuard roles={['ADMIN']}>
              <AdminStats />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
    </Routes>
  </BrowserRouter>
)

export default AppRouter
