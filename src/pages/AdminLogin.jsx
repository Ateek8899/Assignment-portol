import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // In a real app, this would be handled by a proper authentication service
  const handleLogin = (e) => {
    e.preventDefault();
    
    // Temporary hardcoded admin credentials
    // In a real app, this should be handled by a secure backend
    if (email === 'ateek@gmail.com' && password === '12569ateek') {
      // Store user in localStorage
      localStorage.setItem('currentUser', JSON.stringify({
        email,
        name: 'Admin User',
        role: 'admin'
      }));
      
      // Redirect to admin dashboard
      navigate('/admin');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Admin Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-block">
            Login
          </button>
        </form>
        
        <div className="auth-footer">
          <p>For authorized personnel only</p>
        </div>
      </div>
    </div>
  );
}
