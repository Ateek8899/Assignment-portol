import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addTeacherRequest, registerStudent } from '../services/firebaseDb'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    role: 'student',
    subject: '',
    teacherNumber: '',
    photo: '',
    className: '',
    semester: '',
    rollNo: '',
    phone: ''
  })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setMsg('')
    setError('')

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Fill all required fields')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)

    if (form.role === 'student') {
      if (!form.className || !form.semester || !form.rollNo || !form.phone) {
        setError('Please complete all student details')
        setIsSubmitting(false)
        return
      }
      try {
        await registerStudent({
          name: form.name,
          className: form.className,
          semester: form.semester,
          rollNo: form.rollNo,
          phone: form.phone,
          email: form.email,
          password: form.password
        })
        navigate('/student-dashboard')
      } catch (err) {
        setError(err?.message || 'Failed to register student')
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (!form.subject || !form.teacherNumber) {
      setError('Please provide subject and teacher number')
      setIsSubmitting(false)
      return
    }

    try {
      await addTeacherRequest({
        name: form.name,
        email: form.email,
        password: form.password,
        subject: form.subject,
        teacherNumber: form.teacherNumber,
        photo: form.photo
      })
      setMsg('Teacher request submitted. An admin must approve your account before you can log in.')
      setForm(prev => ({
        ...prev,
        password: '',
        confirm: '',
        subject: '',
        teacherNumber: '',
        photo: ''
      }))
    } catch (err) {
      setError(err?.message || 'Failed to submit teacher request')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Select your role to continue</p>
        {error && <p className="muted" style={{ color: 'crimson', textAlign: 'center' }}>{error}</p>}
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

          {form.role === 'student' && (
            <>
              <div className="form-row-2">
                <label>
                  Degree / Class
                  <select value={form.className} onChange={e => setForm({ ...form, className: e.target.value })} required>
                    <option value="">Select degree</option>
                    <option value="BSIT">BSIT</option>
                  </select>
                </label>
                <label>
                  Semester
                  <select value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} required>
                    <option value="">Select semester</option>
                    {['1','2','3','4','5','6','7','8'].map((sem) => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="form-row-2">
                <label>
                  Roll Number
                  <input value={form.rollNo} onChange={e => setForm({ ...form, rollNo: e.target.value })} placeholder="e.g. 20-AR-123" required />
                </label>
                <label>
                  Phone
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 0300-1234567" required />
                </label>
              </div>
            </>
          )}

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
            <button className="btn btn-pro" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Please wait…' : 'Continue'}</button>
            {form.role === 'teacher' && (
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/teacher-login')}>Go to Teacher Login</button>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
