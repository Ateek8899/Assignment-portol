import { Link, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getCurrentStudent, getCurrentTeacher } from '../services/session'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const student = getCurrentStudent()
    const teacher = getCurrentTeacher()
    return !!student || !!teacher
  })

  useEffect(() => {
    const handleStorage = () => {
      const student = getCurrentStudent()
      const teacher = getCurrentTeacher()
      setIsLoggedIn(!!student || !!teacher)
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

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
