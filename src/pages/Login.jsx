import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../services/localDb'

export default function AdminLogin() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = (e) => {
    e.preventDefault()
    setError('')
    const adm = db.adminLogin(name, password)
    if (!adm) { setError('Invalid admin credentials'); return }
    navigate('/admin-dashboard')
  }

  return (
    <section className="auth">
      <div className="auth-card">
        <h1 className="auth-title">Admin Login</h1>
        <p className="auth-subtitle">Set your admin credentials on first login, or enter to continue</p>
        {error && <p className="muted" style={{ color: 'crimson', textAlign: 'center' }}>{error}</p>}
        <form onSubmit={onSubmit} className="form auth-form" autoComplete="off">
          <label>
            Admin Name
            <input value={name} onChange={e => setName(e.target.value)} required />
          </label>
          <label>
            Password
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required />
          </label>
          <button className="btn btn-pro" type="submit">Login</button>
        </form>
      </div>
    </section>
  )
}
