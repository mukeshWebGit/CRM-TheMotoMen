import { Navigate, Route, Routes } from 'react-router-dom'
import { isAuthed } from './lib/auth'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { DashboardPage } from './views/DashboardPage'
import { ForgotPasswordPage } from './views/ForgotPasswordPage'
import { LoginPage } from './views/LoginPage'
import { ProfilePage } from './views/ProfilePage'
import { AddInquiryPage } from './views/AddInquiryPage'
import { ResetPasswordPage } from './views/ResetPasswordPage'

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuthed() ? '/dashboard' : '/login'} replace />}
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-inquiry"
        element={
          <ProtectedRoute>
            <AddInquiryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
