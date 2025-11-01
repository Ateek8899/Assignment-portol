import { useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { addSubmission, getAssignmentById } from '../services/firebaseDb'
import { getCurrentStudent } from '../services/session'

export default function AssignmentDetail() {
  const { id } = useParams()
  const [student] = useState(() => getCurrentStudent())
  const [assignment, setAssignment] = useState(null)
  const [file, setFile] = useState(null)
  const [desc, setDesc] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isPastDue = useMemo(() => {
    if (!assignment?.dueDate) return false
    const now = new Date()
    const due = new Date(`${assignment.dueDate}T23:59:59`)
    return now > due
  }, [assignment])

  useEffect(() => {
    let active = true
    setLoading(true)
    getAssignmentById(id)
      .then((data) => {
        if (!active) return
        setAssignment(data)
      })
      .catch((err) => {
        if (!active) return
        setError(err?.message || 'Failed to load assignment')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  const submit = (e) => {
    e.preventDefault()
    setError('')
    setStatus('')
    if (!student) { setError('Please login as student again'); return }
    if (isPastDue) { setStatus('Submission closed. Due date has passed.'); return }
    if (!file) return alert('Select a file first')
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
    const isAllowed = allowed.includes(file.type) || /\.(doc|docx|pdf)$/i.test(file.name)
    if (!isAllowed) return alert('Only Word (.doc, .docx) or PDF files allowed')

    const reader = new FileReader()
    reader.onload = () => {
      addSubmission({
        assignmentId: id,
        student: {
          id: student.id,
          name: student.name,
          rollNo: student.rollNo,
          className: student.className,
          phone: student.phone
        },
        description: desc,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        dataUrl: reader.result
      })
        .then(() => {
          setStatus('Submitted successfully')
          setFile(null)
          setDesc('')
        })
        .catch((err) => {
          setError(err?.message || 'Failed to submit assignment')
        })
    }
    reader.readAsDataURL(file)
  }

  return (
    <section className="section">
      {loading && <p className="muted">Loading assignment...</p>}
      {error && <p className="muted" style={{ color: 'crimson' }}>{error}</p>}
      {isPastDue && (
        <div className="center-overlay">
          <div className="center-card">
            <h3 className="page-title" style={{ margin: 0 }}>Submission Closed</h3>
            <p className="muted">The due date has passed. You cannot submit this assignment.</p>
          </div>
        </div>
      )}
      <h1 className="page-title">Assignment #{id}</h1>
      {assignment && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <strong>{assignment.subject}</strong>
            <span className="badge">Due: {assignment.dueDate}</span>
          </div>
          <p className="muted">Assigned: {assignment.assignDate}</p>
          <p>{assignment.description}</p>
          <p className="muted">Teacher: {assignment.teacherName}</p>
        </div>
      )}
      <div className="upload-section full-bleed">
        <div className="container upload-inner">
          <h2 className="upload-title">Submit Your Assignment</h2>
          <p className="muted">Upload your submission (Word/PDF). You can add a short description.</p>
          <form onSubmit={submit} className="form" style={{maxWidth: '680px'}}>
            <label>
              Description (optional)
              <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Any notes for the teacher" />
            </label>
            <label>
              File (.doc, .docx, .pdf)
              <input type="file" accept=".doc,.docx,.pdf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={e => setFile(e.target.files?.[0] || null)} />
            </label>
            <div className="card-actions">
              <button className="btn btn-pro" type="submit" disabled={isPastDue}>Submit</button>
            </div>
            {status && <p className="muted">{status}</p>}
          </form>
        </div>
      </div>
    </section>
  )
}
