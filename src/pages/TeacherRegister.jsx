import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerTeacher, getTeachers } from '../services/firebaseDb'
import { getCurrentTeacher } from '../services/session'

export default function TeacherRegister() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    password: '',
    confirm: ''
  })
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const me = getCurrentTeacher()
    if (me) navigate('/teacher/dashboard')
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!form.name || !form.email || !form.phone || !form.subject || !form.password || !form.confirm) {
      setError('Please fill in all fields')
      return
    }

    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }

    try {
      setIsSubmitting(true)
      const teachers = await getTeachers()
      if (teachers.some(t => t.email === form.email)) {
        setError('A teacher with this email already exists')
        setIsSubmitting(false)
        return
      }

      await registerTeacher({
        email: form.email,
        name: form.name,
        phone: form.phone,
        subject: form.subject,
        password: form.password
      })

      setInfo('Registration successful! Redirecting to dashboard...')
      setTimeout(() => {
        navigate('/teacher/dashboard')
      }, 1200)
    } catch (error) {
      console.error('Registration error:', error)
      setError(error?.message || 'An error occurred during registration. Please try again.')
    }
    setIsSubmitting(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <section className="auth">
      <div className="auth-card">
        <h1 className="auth-title">Teacher Registration</h1>
        <p className="auth-subtitle">Create your teacher account</p>
        
        {error && <div className="alert alert-error">{error}</div>}
        {info && <div className="alert alert-success">{info}</div>}
        
        <form onSubmit={handleSubmit} className="form" autoComplete="off">
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              name="name"
              value={form.name} 
              onChange={handleChange}
              placeholder="e.g. Sir Ahmed" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email"
              value={form.email} 
              onChange={handleChange}
              placeholder="name@example.com" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              name="phone"
              value={form.phone} 
              onChange={handleChange}
              placeholder="+92 3XX XXXXXXX" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Subject</label>
            <input 
              type="text" 
              name="subject"
              value={form.subject} 
              onChange={handleChange}
              placeholder="e.g. Mathematics" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password"
              value={form.password} 
              onChange={handleChange}
              placeholder="••••••••" 
              required 
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              type="password" 
              name="confirm"
              value={form.confirm} 
              onChange={handleChange}
              placeholder="••••••••" 
              required 
              minLength="6"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-block" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register as Teacher'}
          </button>
          
          <p className="auth-footer">
            Already have an account? <Link to="/teacher-login">Login here</Link>
          </p>
        </form>
      </div>
    </section>
  )
}
