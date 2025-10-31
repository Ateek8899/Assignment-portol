import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../services/localDb'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'student', subject: '', teacherNumber: '', photo: '' })
  const [msg, setMsg] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    setMsg('')
    if (form.role === 'student') {
      navigate('/student-login')
      return
    }
    if (!form.name || !form.email || !form.password || !form.confirm || (form.role === 'teacher' && (!form.subject || !form.teacherNumber))) { setMsg('Fill all fields'); return }
    if (form.password !== form.confirm) { setMsg('Passwords do not match'); return }
    try {
      db.addTeacherRequest({ name: form.name, email: form.email, password: form.password, subject: form.subject, teacherNumber: form.teacherNumber, photo: form.photo })
      setMsg('Teacher request submitted. An admin must approve your account before you can log in.')
      setForm(prev => ({ ...prev, password: '', confirm: '' }))
    } catch (err) {
      setMsg(err?.message || 'Failed to submit teacher request')
    }
  }

  return (
    <section className="auth">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Select your role to continue</p>
        {msg && <p className="muted" style={{ textAlign: 'center' }}>{msg}</p>}
        <form onSubmit={onSubmit} className="form auth-form">
          <label>
            Full Name
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </label>

          <label>
            {form.role === 'teacher' ? 'Gmail' : 'Email'}
            <input
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              type="email"
              placeholder="name@gmail.com"
              autoComplete="off"
            />
          </label>

          <div className="form-row-2">
            <label>
              Password
              <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} type="password" required />
            </label>
            <label>
              Confirm Password
              <input value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} type="password" required />
            </label>
          </div>

          {form.role === 'teacher' && (
            <>
              <div className="form-row-2">
                <label>
                  Subject
                  <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Mathematics" />
                </label>
                <label>
                  Teacher Number
                  <input value={form.teacherNumber} onChange={e => setForm({ ...form, teacherNumber: e.target.value })} placeholder="e.g. EMP-123" />
                </label>
              </div>
              <label>
                ID Photo
                <input type="file" accept="image/*" onChange={async e => {
                  const file = e.target.files?.[0]
                  if (!file) { setForm(prev => ({ ...prev, photo: '' })); return }
                  const reader = new FileReader()
                  reader.onload = () => setForm(prev => ({ ...prev, photo: reader.result }))
                  reader.readAsDataURL(file)
                }} />
              </label>
            </>
          )}

          <label>
            Role
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </label>

          <div className="card-actions">
            <button className="btn btn-pro" type="submit">Continue</button>
            {form.role === 'teacher' && (
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/teacher-login')}>Go to Teacher Login</button>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
