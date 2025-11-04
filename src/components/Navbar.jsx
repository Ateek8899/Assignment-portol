import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
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
      </div>
    </header>
  )
}
