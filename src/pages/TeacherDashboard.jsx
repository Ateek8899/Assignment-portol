import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../services/localDb'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const me = useMemo(() => db.currentTeacher(), [])
  const profile = useMemo(() => {
    if (!me) return null
    return db.findTeacherByEmail?.(me.email) || db.findTeacherByPhone?.(me.phone) || me
  }, [me])
  const [teacherName, setTeacherName] = useState(me?.name || '')
  const [subject, setSubject] = useState('')
  const [assignDate, setAssignDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [description, setDescription] = useState('')
  const [studentRoll, setStudentRoll] = useState('')
  const [startRoll, setStartRoll] = useState('')
  const [endRoll, setEndRoll] = useState('')
  const [list, setList] = useState([])
  const [course, setCourse] = useState('BSCS')
  const [semester, setSemester] = useState('1')
  const [messages, setMessages] = useState([])
  const [selected, setSelected] = useState(null) // { a, s }
  const myIdentity = (me?.email || me?.phone) || ''

  // Redirect if not logged in
  useEffect(() => {
    if (!me) navigate('/teacher-login')
  }, [me, navigate])

  // Fetch assignments by teacher
  useEffect(() => {
    if (!me) return
    const identity = me.email || me.phone
    setList(db.getAssignmentsByTeacherIdentity(identity))
  }, [me])

  // Load admin messages for this teacher
  const loadMessages = () => {
    if (!me) return
    const all = db.getAdminMessages?.() || []
    const mine = all.filter(m => (
      m.to === 'all' ||
      (m.to === 'teacher' && String(m.phone) === String(me.phone)) ||
      (m.to === 'teacherEmail' && String(m.email || '').toLowerCase() === String(me.email || '').toLowerCase())
    ))
    setMessages(mine)
  }
  useEffect(() => { loadMessages() }, [me])

  // Auto-fill assignment date with today's date
  useEffect(() => {
    if (!assignDate) {
      const today = new Date().toISOString().slice(0, 10)
      setAssignDate(today)
    }
  }, [assignDate])

  // Ensure semester aligns with admin mode options
  useEffect(() => {
    const opts = (db.getSemesterMode?.() === 'even') ? ['2','4','6','8'] : ['1','3','5','7']
    if (!opts.includes(String(semester))) setSemester(opts[0])
  }, [semester])

  const onCreate = (e) => {
    e.preventDefault()
    if (!me) return

    const assignedTo = { cohort: { degree: course, semester: String(semester) } }

    const rec = db.addAssignment({
      subject,
      teacherName,
      classOrCourse: course,
      assignDate,
      dueDate,
      description,
      assignedTo,
      createdBy: me.email || me.phone
    })

    setList(prev => [rec, ...prev])
    setSubject('')
    setAssignDate('')
    setDueDate('')
    setDescription('')
    setStudentRoll('')
    setStartRoll('')
    setEndRoll('')
  }

  const onLogout = () => {
    db.logoutTeacher()
    navigate('/teacher-login')
  }

  return (
    <section className="section dashboard teacher">
      <div className="teacher-hero full-bleed">
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {profile?.photo && (
            <img src={profile.photo} alt={profile.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.5)' }} />
          )}
          <div>
            <h1 className="page-title" style={{ color: '#fff', margin: 0 }}>Teacher Dashboard</h1>
            {profile && (
              <p className="muted" style={{ color: '#e5e7eb', margin: 0 }}>
                Welcome, {profile.name}{profile.subject ? ` • ${profile.subject}` : ''}{profile.email ? ` • ${profile.email}` : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="container" style={{ marginTop: 16 }}>
          <article className="card" style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
            <h3 style={{ marginTop: 0 }}>Admin Messages</h3>
            <div className="grid">
              {messages.map(m => {
                const acks = Array.isArray(m.acks) ? m.acks : []
                const alreadyAcked = myIdentity && acks.includes(String(myIdentity))
                return (
                  <div key={m.id} className="card" style={{ background: '#ffffff' }}>
                    <div className="card-header">
                      <strong>From Admin</strong>
                      <span className="badge">{new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="muted">{m.message}</p>
                    <div className="card-actions" style={{ display: 'flex', gap: 8 }}>
                      <button className="btn" disabled={alreadyAcked} onClick={() => { db.ackAdminMessage?.(m.id, myIdentity); loadMessages() }}>{alreadyAcked ? 'Acknowledged' : 'OK'}</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </article>
        </div>
      )}

      <div className="teacher-form-section full-bleed">
        <div className="container">
          <header className="section-header">
            <h2 className="page-title">Create Assignment</h2>
          </header>

          <article className="card teacher-form-card" style={{ marginBottom: 16 }}>
            <form className="form" onSubmit={onCreate}>
              <label>
                Subject Name
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                  placeholder="e.g. Mathematics"
                />
              </label>

              <label>
                Degree
                <select value={course} onChange={e => setCourse(e.target.value)} required>
                  <option>BSCS</option>
                  <option>BSIT</option>
                  <option>BSCE</option>
                </select>
              </label>

              <div className="grid" style={{ gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: 12 }}>
                <label>
                  Semester
                  <select value={semester} onChange={e => setSemester(e.target.value)} required>
                    {(db.getSemesterMode?.() === 'even' ? ['2','4','6','8'] : ['1','3','5','7']).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Teacher Name
                <input value={teacherName} readOnly />
              </label>

              <label>
                Assignment Date
                <input
                  type="date"
                  value={assignDate}
                  onChange={e => setAssignDate(e.target.value)}
                  required
                />
              </label>

              <label>
                Due Date
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  required
                />
              </label>

              <label>
                Description
                <input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  placeholder="Write assignment task"
                />
              </label>


              <div className="card-actions">
                <button className="btn btn-pro" type="submit">Save Assignment</button>
                <button type="button" className="btn btn-secondary" onClick={onLogout}>Logout</button>
              </div>
            </form>
          </article>
        </div>
      </div>

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
              {a.classOrCourse && (
                <p>
                  <span className="field-label">Class/Course:</span>
                  <span className="field-value">{a.classOrCourse}</span>
                </p>
              )}
              <p>
                <span className="field-label">Teacher:</span>
                <span className="field-value">{a.teacherName}</span>
              </p>
              <p>
                <span className="field-label">Assigned:</span>
                <span className="field-value">{a.assignDate}</span>
              </p>
              <p>
                <span className="field-label">Description:</span>
                <span className="field-value">{a.description}</span>
              </p>

              {a.assignedTo?.rollNo != null && (
                <p>
                  <span className="field-label">To Roll:</span>
                  <span className="field-value">{a.assignedTo.rollNo}</span>
                </p>
              )}
              {a.assignedTo?.rollRange && (
                <p>
                  <span className="field-label">To Roll Range:</span>
                  <span className="field-value">{a.assignedTo.rollRange.start} - {a.assignedTo.rollRange.end}</span>
                </p>
              )}

              <p>
                <span className="field-label">Submissions:</span>
                <span className="field-value">{db.getSubmissionsByAssignment(a.id).length}</span>
              </p>

              {db.getSubmissionsByAssignment(a.id).length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <h4 style={{ margin: '8px 0' }}>Submissions</h4>
                  <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                    {db.getSubmissionsByAssignment(a.id).map(s => (
                      <button
                        key={s.id}
                        className="card"
                        style={{ textAlign: 'left', cursor: 'pointer' }}
                        onClick={() => setSelected({ a, s })}
                      >
                        <div className="card-header">
                          <strong>{s.student.name}</strong>
                          <span className="badge">Roll: {s.student.rollNo}</span>
                        </div>
                        <p className="muted">Click to view record</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </article>
      {selected && (
        <div className="center-overlay" onClick={() => setSelected(null)}>
          <div className="center-card" onClick={e => e.stopPropagation()}>
            <h3 className="page-title" style={{ margin: 0 }}>Student Record</h3>
            <p className="muted">Assignment: {selected.a.subject} • Due {selected.a.dueDate}</p>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <h4 style={{ marginTop: 0 }}>Student</h4>
                <p><span className="field-label">Name:</span><span className="field-value">{selected.s.student.name}</span></p>
                <p><span className="field-label">Roll:</span><span className="field-value">{selected.s.student.rollNo}</span></p>
                <p><span className="field-label">Class:</span><span className="field-value">{selected.s.student.className}</span></p>
                <p><span className="field-label">Phone:</span><span className="field-value">{selected.s.student.phone}</span></p>
              </div>
              <div>
                <h4 style={{ marginTop: 0 }}>Submission</h4>
                <p><span className="field-label">File:</span><span className="field-value">{selected.s.fileName}</span></p>
                <p><span className="field-label">Submitted:</span><span className="field-value">{new Date(selected.s.submittedAt).toLocaleString()}</span></p>
                {selected.s.description && <p className="muted">Note: {selected.s.description}</p>}
                {/* Inline preview */}
                {(() => {
                  const mt = String(selected.s.mimeType || '').toLowerCase()
                  if (mt.includes('pdf')) {
                    return (
                      <iframe title="preview" src={selected.s.dataUrl} style={{ width: '100%', height: 360, border: '1px solid var(--card-border)', borderRadius: 8 }} />
                    )
                  }
                  if (mt.startsWith('image/')) {
                    return (
                      <img src={selected.s.dataUrl} alt={selected.s.fileName} style={{ maxWidth: '100%', maxHeight: 360, borderRadius: 8, border: '1px solid var(--card-border)' }} />
                    )
                  }
                  return (
                    <div className="card-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <a className="btn" href={selected.s.dataUrl} target="_blank" rel="noreferrer">Open</a>
                      <a className="btn" href={selected.s.dataUrl} download={selected.s.fileName}>Download</a>
                    </div>
                  )
                })()}

                <div className="card-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                  {(() => {
                    const due = new Date(`${selected.a.dueDate}T23:59:59`)
                    const sub = new Date(selected.s.submittedAt)
                    const late = sub > due
                    return (
                      <>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="field-label">Grade</span>
                          <select
                            value={selected.s.grade ?? ''}
                            onChange={e => {
                              const val = e.target.value || null
                              db.updateSubmission(selected.s.id, { grade: val })
                              setList(prev => [...prev])
                              setSelected(prev => prev ? { ...prev, s: { ...prev.s, grade: val } } : prev)
                            }}
                            disabled={late}
                          >
                            <option value="">— Select —</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                            <option value="F">F</option>
                          </select>
                        </label>
                        <span className="badge" title={late ? 'Late' : 'On-time'}>{late ? 'Late' : 'On-time'}</span>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
            <div className="card-actions" style={{ marginTop: 12, textAlign: 'right' }}>
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
