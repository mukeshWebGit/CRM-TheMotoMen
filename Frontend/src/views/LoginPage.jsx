import { useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { isAuthed, setToken } from '../lib/auth'
import '../styles/auth.css'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = useMemo(() => {
    const from = location.state?.from
    return typeof from === 'string' && from.startsWith('/') ? from : '/dashboard'
  }, [location.state])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({ email: false, password: false })
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  if (isAuthed()) return <Navigate to={redirectTo} replace />

  const emailError =
    touched.email && !email
      ? 'Email is required.'
      : touched.email && !isValidEmail(email)
        ? 'Enter a valid email address.'
        : ''

  const passwordError =
    touched.password && !password ? 'Password is required.' : ''

  const canSubmit = email && password && isValidEmail(email) && !loading

  async function onSubmit(e) {
    e.preventDefault()
    setTouched({ email: true, password: true })
    setFormError('')
    if (!email || !password || !isValidEmail(email)) return

    try {
      setLoading(true)
      const { data } = await api.post('/api/auth/login', { email, password })
      setToken(data.token)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please try again.'
      setFormError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="loginBg">
      <div className="login-container text-center">
        <img src="/images/Logo.svg" alt="Logo" />
        <div className="loginBox">
          <h2 className="mb-5 mt-0">CRM Login</h2>
          <div className="loginForm pb-5">
            {formError ? <div className="alert">{formError}</div> : null}

            <form onSubmit={onSubmit} noValidate>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Enter Your Email ID"
                  className={`form-control ${emailError ? 'is-invalid' : ''}`}
                  required
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  disabled={loading}
                  aria-invalid={Boolean(emailError)}
                />
                {emailError ? (
                  <div className="invalid-feedback">{emailError}</div>
                ) : null}
              </div>

              <div className="form-group">
                <input
                  type="password"
                  placeholder="Enter Your Password"
                  className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  disabled={loading}
                  aria-invalid={Boolean(passwordError)}
                />
                {passwordError ? (
                  <div className="invalid-feedback">{passwordError}</div>
                ) : null}
              </div>

              <button
                type="submit"
                className="btn blue-btn submit"
                disabled={!canSubmit}
              >
                {loading ? (
                  'Logging in...'
                ) : (
                  <>
                    Login <img src="/images/arrow.svg" alt="" />
                  </>
                )}
              </button>

              <div className="text-right forgot">
                <Link to="/forgot-password">Forgot Password ?</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

