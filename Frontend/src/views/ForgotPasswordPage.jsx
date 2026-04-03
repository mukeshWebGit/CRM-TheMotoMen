import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import '../styles/auth.css'

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const emailError =
    touched && !email
      ? 'Email is required.'
      : touched && !isValidEmail(email)
        ? 'Enter a valid email address.'
        : ''

  async function onSubmit(e) {
    e.preventDefault()
    setTouched(true)
    setMessage('')
    setError('')
    if (!email || !isValidEmail(email)) return

    try {
      setLoading(true)
      const { data } = await api.post('/api/auth/forgot-password', { email })
      setMessage(
        data?.message ||
          'If the account exists, a password reset link will be sent.',
      )
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Request failed. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="loginBg">
      <div className="login-container text-center">
        <img src="/images/Logo.svg" alt="Logo" />
        <div className="loginBox">
          <h2 className="mb-5 mt-0">Forgot Password</h2>
          <div className="loginForm pb-5">
            {error ? <div className="alert">{error}</div> : null}
            {message ? <div className="alert success">{message}</div> : null}

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
                  onBlur={() => setTouched(true)}
                  disabled={loading}
                  aria-invalid={Boolean(emailError)}
                />
                {emailError ? (
                  <div className="invalid-feedback">{emailError}</div>
                ) : null}
              </div>

              <button
                type="submit"
                className="btn blue-btn submit"
                disabled={!email || !isValidEmail(email) || loading}
              >
                {loading ? (
                  'Sending...'
                ) : (
                  <>
                    Send <img src="/images/arrow.svg" alt="" />
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

