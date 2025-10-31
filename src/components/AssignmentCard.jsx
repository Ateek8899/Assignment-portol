import { Link } from 'react-router-dom'

export default function AssignmentCard({ id, title, dueDate, description }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
        <span className="badge">Due: {new Date(dueDate).toLocaleDateString()}</span>
      </div>
      <p className="muted">{description}</p>
      <div className="card-actions">
        <Link to={`/assignments/${id}`} className="btn">View</Link>
      </div>
    </div>
  )
}
