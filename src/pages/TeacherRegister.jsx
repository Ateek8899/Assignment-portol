import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerTeacher, getTeachers } from '../services/firebaseDb';
import { getCurrentTeacher } from '../services/session';

export default function TeacherRegister() {
  // Teacher self-registration state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const me = getCurrentTeacher();
    if (me) navigate('/teacher/dashboard');
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!name || !email || !phone || !subject || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      const teachers = await getTeachers();
      if (teachers.some(t => t.email === email)) {
        setError('A teacher with this email already exists');
        setIsSubmitting(false);
        return;
      }

      await registerTeacher({
        email,
        name,
        phone,
        subject,
        password
      });

      setInfo('Registration successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/teacher/dashboard');
      }, 1200);

    } catch (error) {
      console.error('Registration error:', error);
      setError(error?.message || 'An error occurred during registration. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <section className="section auth-section">
      <div className="container">
        <div className="auth-card">
          <h1 className="auth-title">Teacher Registration</h1>
          <p className="auth-subtitle">Create your teacher account to get started</p>
          
          {error && <div className="alert alert-error">{error}</div>}
          {info && <div className="alert alert-success">{info}</div>}
          
          <form onSubmit={handleSubmit} className="form" autoComplete="off">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. Sir Ahmed" 
                required 
              />
            </div>
            
            <div className="form-row-2">
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="name@example.com" 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Phone</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="03001234567" 
                  pattern="^[0-9]{10,14}$" 
                  required 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Subject</label>
              <input 
                type="text" 
                value={subject} 
                onChange={e => setSubject(e.target.value)} 
                placeholder="e.g. Mathematics" 
                required 
              />
            </div>
            
            <div className="form-row-2">
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Create a password" 
                  minLength="6"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  placeholder="Confirm your password" 
                  minLength="6"
                  required 
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
                Register
              </button>
              
              <p className="auth-footer">
                Already have an account? <Link to="/teacher-login">Login here</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
