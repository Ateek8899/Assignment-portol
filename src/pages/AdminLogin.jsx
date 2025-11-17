import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

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

  // Add particle effect for background
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.width = `${Math.random() * 4 + 2}px`;
      particle.style.height = particle.style.width;
      particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
      document.querySelector('.login-background').appendChild(particle);
    };

    // Create particles
    for (let i = 0; i < 30; i++) {
      createParticle();
    }

    // Cleanup
    return () => {
      const particles = document.querySelectorAll('.particle');
      particles.forEach(p => p.remove());
    };
  }, []);

  return (
    <div className="auth-container login-background">
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
        
        <footer className="auth-footer">
          <div className="footer-content">
            <div className="developer-info">
              <div className="developer-avatar">
                <img 
                  src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&auto=format&fit=crop" 
                  alt="Developer" 
                  className="developer-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/80';
                  }}
                />
                <div className="developer-details p">
                  <h4>John Doe</h4>
                  <p>Full Stack Developer</p>
                  <p className="developer-email">johndoe@example.com</p>
                </div>
              </div>
              <div className="social-links">
                <a href="https://github.com/johndoe" target="_blank" rel="noopener noreferrer">
                  <FaGithub className="social-icon" />
                </a>
                <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin className="social-icon" />
                </a>
                <a href="mailto:developer@example.com">
                  <FaEnvelope className="social-icon" />
                </a>
              </div>
            </div>
            <div className="footer-bottom">
              <p>© {new Date().getFullYear()} Assignment Portal. All rights reserved.</p>
              <p>For authorized personnel only</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
