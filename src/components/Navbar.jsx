import { Link, NavLink } from 'react-router-dom'
import { db } from '../services/localDb'

export default function Navbar() {
  const isStudent = !!db.currentStudent()
  const isTeacher = !!db.currentTeacher()
  const isLoggedIn = isStudent || isTeacher
  return (
    <header className="nav">
      <div className="nav-bar">
        <Link to="/" className="brand">IntelliTask</Link>
        <nav>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/student">Student</NavLink>
          <NavLink to="/teacher">Teacher</NavLink>
          <NavLink to="/admin-login">Admin</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
        {!isLoggedIn && (
          <div className="actions">
            <NavLink to="/login" className="btn btn-nav">Log in</NavLink>
            <NavLink to="/register" className="btn btn-nav">Sign up</NavLink>
          </div>
        )}
      </div>
    </header>
  )
}
