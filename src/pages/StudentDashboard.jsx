import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db } from '../services/localDb'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const me = useMemo(() => db.currentStudent(), [])
  const [list, setList] = useState([])

  useEffect(() => {
    if (!me) {
      navigate('/student-login')
      return
    }
    setList(db.getAssignmentsForStudent(me))
  }, [me, navigate])

  const onLogout = () => {
    db.logoutStudent()
    navigate('/student-login')
  }

  return (
    <section className="section dashboard">
      <div className="container">
        <header className="section-header">
          <h1 className="page-title">Student Dashboard</h1>
          {me && <p className="muted">Welcome, {me.name} (Roll {me.rollNo})</p>}
        </header>

        <article className="card" style={{ marginBottom: 16 }}>
          <div className="card-actions">
            <button className="btn btn-secondary" onClick={onLogout}>Logout</button>
          </div>
        </article>

        <article className="card">
          <h3 style={{ marginTop: 0 }}>Your Assignments</h3>
          {list.length === 0 && <p className="muted">No assignments yet.</p>}
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
                  const sub = db.getSubmissionByAssignmentAndRoll(a.id, me?.rollNo)
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
