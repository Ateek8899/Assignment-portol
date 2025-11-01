import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAssignmentsForStudent, logoutStudent } from '../services/firebaseDb'
import { getCurrentStudent } from '../services/session'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [student] = useState(() => getCurrentStudent())
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!student) {
      navigate('/student-login')
      return
    }
    let active = true
    setLoading(true)
    getAssignmentsForStudent(student)
      .then((assignments) => {
        if (!active) return
        setList(assignments)
      })
      .catch((err) => {
        if (!active) return
        setError(err?.message || 'Failed to load assignments')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [student, navigate])

  const onLogout = () => {
    logoutStudent().finally(() => {
      navigate('/student-login')
    })
  }

  return (
    <section className="section dashboard">
      <div className="container">
        <header className="section-header">
          <h1 className="page-title">Student Dashboard</h1>
          {student && <p className="muted">Welcome, {student.name} (Roll {student.rollNo})</p>}
        </header>

        <article className="card" style={{ marginBottom: 16 }}>
          <div className="card-actions">
            <button className="btn btn-secondary" onClick={onLogout}>Logout</button>
          </div>
        </article>

        {loading && <p className="muted">Loading assignments...</p>}
        {error && <p className="muted" style={{ color: 'crimson' }}>{error}</p>}

        <article className="card">
          <h3 style={{ marginTop: 0 }}>Your Assignments</h3>
          {!loading && list.length === 0 && <p className="muted">No assignments yet.</p>}
          <div className="grid">
            {list.map(a => (
              <div key={a.id} className="card">
                <div className="card-header">
                  <strong className="subject-title">{a.subject}</strong>
                  <span className="badge">Due: {a.dueDate}</span>
                </div>
                <p>
                  <span className="field-label">Assigned:</span>
                  <span className="field-value">{a.assignDate}</span>
                </p>
                <p>
                  <span className="field-label">Description:</span>
                  <span className="field-value">{a.description}</span>
                </p>
                <p>
                  <span className="field-label">Teacher:</span>
                  <span className="field-value">{a.teacherName}</span>
                </p>
                {(() => {
                  const sub = a.submission
                  const pastDue = (() => {
                    try { return new Date() > new Date(`${a.dueDate}T23:59:59`) } catch { return false }
                  })()
                  return (
                    <div className="card-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      {!sub && !pastDue && (
                        <Link className="btn" to={`/assignments/${a.id}`}>Open & Submit</Link>
                      )}
                      {sub && (
                        <span className="badge">Grade: {sub.grade ?? 'Pending'}</span>
                      )}
                      {!sub && pastDue && (
                        <span className="badge" title="No submission by due date">Grade: F</span>
                      )}
                    </div>
                  )
                })()}
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
