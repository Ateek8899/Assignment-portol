import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginTeacher, resetPassword } from '../services/firebaseDb'
import { getCurrentTeacher } from '../services/session'

export default function TeacherLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [forgotOpen, setForgotOpen] = useState(false)
  const [fpEmail, setFpEmail] = useState('')
  const [fpNew, setFpNew] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const me = getCurrentTeacher()
    if (me) navigate('/teacher/dashboard')
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      setIsSubmitting(true)
      await loginTeacher({ email, password })
      navigate('/teacher/dashboard')
    } catch (error) {
      setError(error?.message || 'An error occurred during login')
    }
    setIsSubmitting(false)
  }

  const handleResetPassword = () => {
    // In a real app, you would send a password reset email
    // For local storage, we'll just show a message
    if (!fpEmail) {
      setError('Please enter your email address')
      return
    }

    setIsSubmitting(true)
    resetPassword(fpEmail)
      .then(() => setMessage('Password reset email sent. Check your inbox.'))
      .catch((err) => setError(err?.message || 'Failed to send reset email.'))
      .finally(() => setIsSubmitting(false))
  }

  return (
    <section className="auth">
      <div className="auth-card">
        <h1 className="auth-title">Teacher Login</h1>
        <p className="auth-subtitle">Enter your credentials to continue</p>
        {error && <p className="muted" style={{ color: 'crimson', textAlign: 'center' }}>{error}</p>}
        {message && <p className="muted" style={{ color: 'crimson', textAlign: 'center' }}>{message}</p>}
        <form onSubmit={handleLogin} className="form auth-form" autoComplete="off">
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@gmail.com" autoComplete="off" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
          </label>
          <div className="card-actions">
            <button className="btn btn-pro" type="submit" disabled={isSubmitting}>Login</button>
            <button className="btn btn-light" type="button" onClick={() => { setForgotOpen(true); setError('') }}>Forgot password?</button>
          </div>
          <div>
            <small className="muted">New teacher? <Link to="/teacher-register">Register</Link></small>
          </div>
        </form>

        {forgotOpen && (
          <div className="center-overlay" onClick={() => setForgotOpen(false)}>
            <div className="center-card" onClick={(e) => e.stopPropagation()}>
              <h3 className="page-title" style={{ margin: 0 }}>Reset Password</h3>
              <p className="muted">Enter your registered email to set a new password.</p>
              <form className="form" onSubmit={(e) => { e.preventDefault(); handleResetPassword() }}>
                <label>Email<input type="email" value={fpEmail} onChange={e => setFpEmail(e.target.value)} required /></label>
                <div className="card-actions"><button className="btn btn-pro" type="submit">Send Reset Email</button></div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
