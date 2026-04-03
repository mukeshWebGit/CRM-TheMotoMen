import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import '../styles/auth.css'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid reset link. Missing token or email.')
    }
  }, [token, email])

  const passwordError =
    touched && !password
      ? 'Password is required.'
      : touched && password.length < 6
        ? 'Password must be at least 6 characters.'
        : ''

  const confirmError =
    touched && !confirmPassword
      ? 'Please confirm your password.'
      : touched && password !== confirmPassword
        ? 'Passwords do not match.'
        : ''

  async function onSubmit(e) {
    e.preventDefault()
    setTouched(true)
    setMessage('')
    setError('')
    if (!password || password.length < 6 || password !== confirmPassword) return

    try {
      setLoading(true)
      const { data } = await api.post('/api/auth/reset-password', {
        token,
        email,
        password,
      })
      setMessage(data?.message || 'Password reset successfully.')
      // Optionally, auto-login or redirect
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Reset failed. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="loginBg">
        <div className="login-container text-center">
          <img src="/images/Logo.svg" alt="Logo" />
          <div className="loginBox">
            <h2 className="mb-5 mt-0">Reset Password</h2>
            <div className="alert">{error}</div>
            <div className="text-right forgot">
              <Link to="/login">Back to Login</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="loginBg">
      <div className="login-container text-center">
        <img src="/images/Logo.svg" alt="Logo" />
        <div className="loginBox">
          <h2 className="mb-5 mt-0">Reset Password</h2>
          <div className="loginForm pb-5">
            {error ? <div className="alert">{error}</div> : null}
            {message ? <div className="alert success">{message}</div> : null}

            <form onSubmit={onSubmit} noValidate>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="New Password"
                  className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched(true)}
                  disabled={loading}
                  aria-invalid={Boolean(passwordError)}
                />
                {passwordError ? (
                  <div className="invalid-feedback">{passwordError}</div>
                ) : null}
              </div>

              <div className="form-group">
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className={`form-control ${confirmError ? 'is-invalid' : ''}`}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched(true)}
                  disabled={loading}
                  aria-invalid={Boolean(confirmError)}
                />
                {confirmError ? (
                  <div className="invalid-feedback">{confirmError}</div>
                ) : null}
              </div>

              <button
                type="submit"
                className="btn blue-btn submit"
                disabled={!password || password.length < 6 || password !== confirmPassword || loading}
              >
                {loading ? (
                  'Resetting...'
                ) : (
                  <>
                    Reset Password <img src="/images/arrow.svg" alt="" />
                  </>
                )}
              </button>

              <div className="text-right forgot">
                <Link to="/login">Back to Login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}