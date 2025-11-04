import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerTeacher, findTeacherByEmail } from '../services/firebaseDb';
import { getCurrentTeacher } from '../services/session';
import './TeacherDashboard.css';

export default function TeacherRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const me = getCurrentTeacher();
    if (me) navigate('/teacher/dashboard');
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    const { name, email, phone, subject, password, confirmPassword } = form;

    if (!name || !email || !phone || !subject || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Check if teacher with this email already exists
      const existingTeacher = await findTeacherByEmail(email);
      if (existingTeacher) {
        setError('A teacher with this email already exists');
        return;
      }

      // Register the teacher
      await registerTeacher({
        name,
        email,
        phone,
        subject,
        password
      });

      setInfo('Registration successful! Redirecting to dashboard...');
      
      // Redirect to teacher dashboard after successful registration
      setTimeout(() => {
        navigate('/teacher/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Registration error:', error);
      setError(error?.message || 'An error occurred during registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <h1 className="auth-title">Teacher Registration</h1>
        <p className="auth-subtitle">Create your teacher account to get started</p>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        
        {info && (
          <div className="alert alert-success">
            {info}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Sir Ahmed"
              required
            />
          </div>
          
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="03001234567"
                pattern="^[0-9]{10,14}$"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="e.g. Mathematics"
              required
            />
          </div>
          
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                minLength="6"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                minLength="6"
                required
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
            
            <p className="auth-footer">
              Already have an account?{' '}
              <Link to="/teacher-login">Log in here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
