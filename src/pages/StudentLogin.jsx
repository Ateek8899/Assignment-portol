import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, getStudents, addStudent } from '../services/localDb'

export default function StudentLogin() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')   // ✅ Added this line
  const [studentName, setStudentName] = useState('')
  const [className, setClassName] = useState('')
  const [rollNo, setRollNo] = useState('')
  const [phone, setPhone] = useState('')
  const [semester, setSemester] = useState('1')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [forgotOpen, setForgotOpen] = useState(false)
  const [rangeHint, setRangeHint] = useState('')
  const [fpEmail, setFpEmail] = useState('')
  const [fpPhone, setFpPhone] = useState('')
  const [fpNew, setFpNew] = useState('')

  useEffect(() => {
    const me = db.currentStudent()
    if (me) navigate('/student-dashboard')
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      // Get all students from local storage
      const students = await getStudents()
      const student = students.find(s => s.email === email && s.password === password)
      
      if (student) {
        // Store user in localStorage
        localStorage.setItem('currentUser', JSON.stringify({
          id: student.id,
          email: student.email,
          name: student.name,
          rollNo: student.rollNo,
          role: 'student'
        }))
        
        navigate('/student-dashboard')
      } else {
        setError('Invalid email or password')
      }
    } catch (error) {
      setError('An error occurred during login')
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!studentName || !className || !semester || !rollNo || !phone || !email || !password || !confirmPassword) { setError('Please fill all fields'); return }
    const rng = db.getDegreeRange?.(className, semester)
    const rn = Number(rollNo)
    if (rng && (Number.isNaN(rn) || rn < Number(rng.start) || rn > Number(rng.end))) {
      setError(`Your roll number must be between ${rng.start} and ${rng.end} for ${className} semester ${semester}`)
      return
    }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (db.isRollRegistered(rollNo)) { setError('This roll number is already registered'); return }
    if (db.isEmailRegistered(email)) { setError('This email is already registered'); return }
    try {
      const student = { name: studentName, className, semester, rollNo, phone, email, password }
      await addStudent(student)
      localStorage.setItem('currentUser', JSON.stringify({
        id: student.id,
        email: student.email,
        name: student.name,
        rollNo: student.rollNo,
        role: 'student'
      }))
      navigate('/student')
    } catch (err) {
      setError('Failed to register. This email may already be in use.')
    }
  }

  const handleResetPassword = () => {
    // In a real app, you would send a password reset email
    // For local storage, we'll just show a message
    if (!fpEmail) {
      setError('Please enter your email address')
      return
    }
    
    setMessage('Password reset functionality is not available in local storage mode. Please contact support.')
  }

  return (
    <section className="auth">
      <div className="auth-card">
        <h1 className="auth-title">{mode === 'login' ? 'Student Login' : 'Student Verification'}</h1>
        <p className="auth-subtitle">{mode === 'login' ? 'Enter your roll and phone to continue' : 'Enter your details to continue'}</p>
        {error && <p className="muted" style={{ color: 'crimson', textAlign: 'center' }}>{error}</p>}
        {message && <p className="muted" style={{ color: 'crimson', textAlign: 'center' }}>{message}</p>}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="form auth-form" autoComplete="off">
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="off"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="off"
                required
              />
            </label>
            <div className="card-actions">
              <button className="btn btn-pro" type="submit">Login</button>
              <button className="btn btn-secondary" type="button" onClick={() => { setMode('register'); setError('') }}>New? Register</button>
              <button className="btn btn-light" type="button" onClick={() => { setForgotOpen(true); setError('') }}>Forgot password?</button>
            </div>
          </form>
        ) : (
          <form onSubmit={onSubmit} className="form auth-form" autoComplete="off">
            <label>
              Student Name
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your Name"
                autoComplete="off"
                required
              />
            </label>

            <div className="form-row-2">
              <label>
                Class
                <select
                  value={className}
                  onChange={(e) => {
                    const v = e.target.value
                    setClassName(v)
                    const r = db.getDegreeRange?.(v, semester)
                    setRangeHint(r ? `Your roll number must be between ${r.start} and ${r.end} for ${v} semester ${semester}` : '')
                  }}
                  required
                >
                  <option value="" disabled>Select Degree</option>
                  <option>BSCS</option>
                  <option>BSIT</option>
                  <option>BSCE</option>
                </select>
              </label>

            </div>

            <div className="form-row-2">
              <label>
                Semester
                <select value={semester} onChange={(e) => {
                  const s = e.target.value
                  setSemester(s)
                  if (className) {
                    const r = db.getDegreeRange?.(className, s)
                    setRangeHint(r ? `Your roll number must be between ${r.start} and ${r.end} for ${className} semester ${s}` : '')
                  }
                }} required>
                  {(db.getSemesterMode?.() === 'even' ? ['2','4','6','8'] : ['1','3','5','7']).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>

            {rangeHint && <p className="muted" style={{ marginTop: -6 }}>{rangeHint}</p>}

            <label>
              Roll No
              <input
                type="number"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="Enter your AG NO"
                autoComplete="off"
                required
              />
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your Mobile Number"
                pattern="^[0-9]{10,14}$"
                autoComplete="off"
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="off"
                required
              />
            </label>

            <div className="form-row-2">
              <label>
                Password
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </label>
              <label>
                Confirm Password
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </label>
            </div>

            <div className="card-actions">
              <button className="btn btn-pro" type="submit">Continue</button>
              <button className="btn btn-secondary" type="button" onClick={() => { setMode('login'); setError('') }}>Already registered? Login</button>
            </div>
          </form>
        )}

        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <button className="btn btn-light" type="button" onClick={() => navigate('/student')}>Go to Dashboard</button>
        </div>

        {forgotOpen && (
          <div className="center-overlay" onClick={() => setForgotOpen(false)}>
            <div className="center-card" onClick={(e) => e.stopPropagation()}>
              <h3 className="page-title" style={{ margin: 0 }}>Reset Password</h3>
              <p className="muted">Enter your registered email and phone to set a new password.</p>
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
