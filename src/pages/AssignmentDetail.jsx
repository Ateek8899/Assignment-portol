import { useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { db } from '../services/localDb'

export default function AssignmentDetail() {
  const { id } = useParams()
  const me = useMemo(() => db.currentStudent(), [])
  const assignment = useMemo(() => db.getAssignmentById(id), [id])
  const [file, setFile] = useState(null)
  const [desc, setDesc] = useState('')
  const [status, setStatus] = useState('')
  const isPastDue = useMemo(() => {
    if (!assignment?.dueDate) return false
    const now = new Date()
    const due = new Date(`${assignment.dueDate}T23:59:59`)
    return now > due
  }, [assignment])

  const submit = (e) => {
    e.preventDefault()
    if (!me) return alert('Please login as student again')
    if (isPastDue) { setStatus('Submission closed. Due date has passed.'); return }
    if (!file) return alert('Select a file first')
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
    const isAllowed = allowed.includes(file.type) || /\.(doc|docx|pdf)$/i.test(file.name)
    if (!isAllowed) return alert('Only Word (.doc, .docx) or PDF files allowed')

    const reader = new FileReader()
    reader.onload = () => {
      db.addSubmission({
        assignmentId: id,
        student: { name: me.name, rollNo: me.rollNo, className: me.className, phone: me.phone },
        description: desc,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        dataUrl: reader.result,
        submittedAt: new Date().toISOString()
      })
      setStatus('Submitted successfully')
      setFile(null)
      setDesc('')
    }
    reader.readAsDataURL(file)
  }

  return (
    <section className="section">
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
