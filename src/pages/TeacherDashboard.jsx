import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  currentTeacher,
  getAssignmentsByTeacherIdentity,
  getAdminMessages,
  getSemesterMode,
  addAssignment,
  logoutTeacher,
  ackAdminMessage,
  getSubmissionsByAssignment,
  updateSubmission
} from '../services/firebaseDb'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const me = useMemo(() => currentTeacher(), [])
  const [profile] = useState(me || null)

  const [teacherName] = useState(me?.name || '')
  const [subject, setSubject] = useState('')
  const [assignDate, setAssignDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [description, setDescription] = useState('')

  const [assignments, setAssignments] = useState([])
  const [filteredAssignments, setFilteredAssignments] = useState([])

  // Initialize course state with the first available option
  const [course, setCourse] = useState('BSIT')
  const [semester, setSemester] = useState('1')
  const [filterSemester, setFilterSemester] = useState('all')

  const [messages, setMessages] = useState([])
  const [selected, setSelected] = useState(null)

  const [loadingAssignments, setLoadingAssignments] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(true)

  const [semesterMode, setSemesterMode] = useState('odd')

  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const myIdentity = me?.email || me?.phone || me?.id || ''

  const semesterOptions = useMemo(() => (
    semesterMode === 'even' ? ['2', '4', '6', '8'] : ['1', '3', '5', '7']
  ), [semesterMode])

  const allSemesterOptions = ['1','2','3','4','5','6','7','8']

  // Redirect if not logged in
  useEffect(() => {
    if (!me) navigate('/teacher-login')
  }, [me, navigate])

  // Load assignments + submissions
  useEffect(() => {
    if (!me) return

    setLoadingAssignments(true)
    const identity = me.email || me.phone || me.id

    getAssignmentsByTeacherIdentity(identity)
      .then(async list => {
        const processed = await Promise.all(
          list.map(async a => {
            const subs = await getSubmissionsByAssignment(a.id)
            return {
              ...a,
              submissions: subs,
              submissionCount: subs.length,
              pendingCount: subs.filter(s => !s.grade).length
            }
          })
        )

        setAssignments(processed)

        if (filterSemester !== 'all') {
          setFilteredAssignments(processed.filter(a => a.semester === filterSemester))
        } else {
          setFilteredAssignments(processed)
        }
      })
      .finally(() => setLoadingAssignments(false))
  }, [me, filterSemester])

  // Load admin messages
  const loadMessages = () => {
    if (!me) return

    setLoadingMessages(true)
    getAdminMessages()
      .then(all => {
        const mine = all.filter(m =>
          m.to === 'all' ||
          (m.to === 'teacher' && m.phone === me.phone) ||
          (m.to === 'teacherEmail' && String(m.email).toLowerCase() === String(me.email).toLowerCase())
        )
        setMessages(mine)
      })
      .finally(() => setLoadingMessages(false))
  }

  useEffect(() => { loadMessages() }, [me])

  // Auto set today's date
  useEffect(() => {
    if (!assignDate) {
      const today = new Date().toISOString().slice(0, 10)
      setAssignDate(today)
    }
  }, [assignDate])

  // Load semester mode
  useEffect(() => {
    getSemesterMode().then(mode => mode && setSemesterMode(mode))
  }, [])

  // Fix semester if not allowed
  useEffect(() => {
    if (!semesterOptions.includes(String(semester))) {
      setSemester(semesterOptions[0])
    }
  }, [semesterOptions, semester])

  const onCreate = async (e) => {
    e.preventDefault()

    setFormError('')
    setFormSuccess('')

    try {
      // Ensure course is in uppercase for consistency
      const normalizedCourse = course ? course.toUpperCase() : 'BSIT';
      
      const newRecord = await addAssignment({
        teacherId: me.id,
        teacherName,
        teacherEmail: me.email,
        teacherPhone: me.phone,
        subject,
        classOrCourse: normalizedCourse,
        semester: String(semester || '1'),
        assignDate,
        dueDate,
        description
      })

      setAssignments(prev => [{...newRecord, submissions: []}, ...prev])
      setSubject('')
      setAssignDate('')
      setDueDate('')
      setDescription('')
      setFormSuccess('Assignment created successfully')
    } catch (err) {
      setFormError(err.message || 'Failed to create assignment')
    }
  }

  const onLogout = () => {
    logoutTeacher().finally(() => navigate('/teacher-login'))
  }

  return (
    <section className="section dashboard teacher">

      {/* ---------- HEADER ---------- */}
      <div className="teacher-hero full-bleed">
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {profile?.photo && (
            <img
              src={profile.photo}
              alt={profile.name}
              style={{ width: 64, height: 64, borderRadius: '50%' }}
            />
          )}
          <div>
            <h1 className="page-title" style={{ color: '#fff' }}>Teacher Dashboard</h1>
            <p style={{ color: '#eee' }}>
              Welcome, {profile?.name} • {profile?.email}
            </p>
          </div>
        </div>
      </div>

      {/* ---------- CREATE ASSIGNMENT ---------- */}
      <div className="teacher-form-section full-bleed">
        <div className="container">

          <article className="card teacher-form-card">
            <form className="form" onSubmit={onCreate}>

              <label>
                Subject
                <input value={subject} onChange={e => setSubject(e.target.value)} required />
              </label>

              <label>
                Class/Course
                <select 
                  value={course} 
                  onChange={e => setCourse(e.target.value)}
                  required
                >
                  <option value="BSIT">BSIT</option>
                  <option value="BSCS">BSCS</option>
                </select>
              </label>

              <label>
                Semester
                <select value={semester} onChange={e => setSemester(e.target.value)}>
                  {semesterOptions.map(s => <option key={s}>{s}</option>)}
                </select>
              </label>

              <label>
                Assignment Date
                <input type="date" value={assignDate} onChange={e => setAssignDate(e.target.value)} required />
              </label>

              <label>
                Due Date
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
              </label>

              <label>
                Description
                <input value={description} onChange={e => setDescription(e.target.value)} required />
              </label>

              <div className="card-actions">
                <button className="btn btn-pro">Save Assignment</button>
                <button type="button" className="btn btn-secondary" onClick={onLogout}>Logout</button>
              </div>

            </form>
          </article>

        </div>
      </div>

      {/* ---------- ASSIGNMENT LIST ---------- */}
      <article className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3>Your Assignments</h3>

          <label>
            Filter semester:
            <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)}>
              <option value="all">All</option>
              {allSemesterOptions.map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </label>
        </div>

        {loadingAssignments ? (
          <p>Loading...</p>
        ) : filteredAssignments.length === 0 ? (
          <p>No assignments found.</p>
        ) : (
          <div className="grid">
            {filteredAssignments.map(a => (
              <div key={a.id} className="card">
                <strong>{a.subject}</strong>
                <p>Due: {a.dueDate}</p>
                <p>Submissions: {a.submissions.length}</p>

                {a.submissions.length > 0 && (
                  <div className="grid">
                    {a.submissions.map(s => (
                      <button key={s.id} className="card" onClick={() => setSelected({ assignment: a, submission: s })}>
                        <strong>{s.student.name}</strong>
                        <p>Roll: {s.student.rollNo}</p>
                        <p>Click to view</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </article>

      {/* ---------- SUBMISSION MODAL ---------- */}
      {selected && (
        <div className="center-overlay" onClick={() => setSelected(null)}>
          <div className="center-card" onClick={e => e.stopPropagation()}>

            <h3>Student Record</h3>
            <p>
              Assignment: {selected.assignment.subject} • Due {selected.assignment.dueDate}
            </p>

            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <h4>Student Info</h4>
                <p>Name: {selected.submission.student.name}</p>
                <p>Roll: {selected.submission.student.rollNo}</p>
                <p>Class: {selected.submission.student.className}</p>
              </div>

              <div>
                <h4>Submission</h4>
                <p>File: {selected.submission.fileName}</p>
                <p>Submitted: {new Date(selected.submission.submittedAt).toLocaleString()}</p>

                {/* Preview */}
                {(() => {
                  const mt = selected.submission.mimeType?.toLowerCase() || ''

                  if (mt.includes('pdf')) {
                    return <iframe src={selected.submission.dataUrl} style={{ width: '100%', height: 360 }} />
                  }

                  if (mt.startsWith('image/')) {
                    return <img src={selected.submission.dataUrl} style={{ maxWidth: '100%', maxHeight: 360 }} />
                  }

                  return (
                    <a className="btn" href={selected.submission.dataUrl} target="_blank" rel="noreferrer">
                      Open File
                    </a>
                  )
                })()}

                {/* Grade */}
                <label style={{ marginTop: 10 }}>
                  Grade:
                  <select
                    value={selected.submission.grade || ''}
                    onChange={async e => {
                      const value = e.target.value || null
                      await updateSubmission(selected.submission.id, { grade: value })
                      setSelected(prev => ({ ...prev, submission: { ...prev.submission, grade: value } }))
                    }}
                  >
                    <option value="">Select</option>
                    <option>A</option>
                    <option>B</option>
                    <option>C</option>
                    <option>D</option>
                    <option>F</option>
                  </select>
                </label>

              </div>
            </div>

            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}

    </section>
  )
}
