import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getTeachers,
  getStudents,
  getAssignments,
  logoutAdmin,
  getSemesterMode,
  setSemesterMode,
  registerTeacher
} from "../services/firebaseDb";
import { firestore } from "../services/firebase";
import { doc, deleteDoc, collection } from "firebase/firestore";
import { getCurrentAdmin } from "../services/session";
import "./AdminDashboard.css";

// ===== Icons =====
const UserIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const AssignmentIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const ClockIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [admin, setAdmin] = useState(null);
  const [currentSemesterMode, setCurrentSemesterMode] = useState('odd');
  const [isUpdatingSemester, setIsUpdatingSemester] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // New teacher form state
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    password: 'default123', // Default password that can be changed later
    confirmPassword: 'default123'
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    subject: "",
    phone: "",
    profileImage: null,
    previewImage: null,
  });

  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    password: "",
    rollNumber: "",
    class: "",
    section: "",
    phone: "",
    address: "",
    parentName: "",
    parentPhone: "",
    profileImage: null,
    previewImage: null,
  });

  useEffect(() => {
    const admin = getCurrentAdmin();
    if (!admin) {
      navigate("/admin-login");
      return;
    }
    setAdmin(admin);
    loadData();
    loadSemesterMode();
  }, [navigate]);

  const loadSemesterMode = async () => {
    try {
      const mode = await getSemesterMode();
      setCurrentSemesterMode(mode || 'odd');
    } catch (error) {
      console.error('Error loading semester mode:', error);
    }
  };

  const handleSemesterModeToggle = async () => {
    try {
      setIsUpdatingSemester(true);
      const newMode = currentSemesterMode === 'odd' ? 'even' : 'odd';
      await setSemesterMode(newMode);
      setCurrentSemesterMode(newMode);
    } catch (error) {
      console.error('Error updating semester mode:', error);
    } finally {
      setIsUpdatingSemester(false);
    }
  };

  const loadData = async () => {
    try {
      const [teachersData, studentsData, assignmentsData] = await Promise.all([
        getTeachers(),
        getStudents(),
        getAssignments(),
      ]);
      setTeachers(teachersData || []);
      setStudents(studentsData || []);
      setAssignments(assignmentsData || []);
    } catch (err) {
      console.error("Failed to load admin dashboard data", err);
      setError("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage" && files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profileImage: files[0],
          previewImage: reader.result,
        }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleStudentInputChange = (e, field) => {
    const { value, files } = e.target;
    if (field === "profileImage" && files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudentForm((prev) => ({
          ...prev,
          profileImage: files[0],
          previewImage: reader.result,
        }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setStudentForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleLogout = () => {
    logoutAdmin().finally(() => navigate("/admin-login"));
  };

  // Handle input change for new teacher form
  const handleNewTeacherChange = (e) => {
    const { name, value } = e.target;
    setNewTeacher(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate new teacher form
  const validateForm = () => {
    const errors = {};
    if (!newTeacher.name.trim()) errors.name = 'Name is required';
    if (!newTeacher.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newTeacher.email)) {
      errors.email = 'Email is invalid';
    }
    if (!newTeacher.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10,15}$/.test(newTeacher.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    if (!newTeacher.subject.trim()) errors.subject = 'Subject is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add new teacher
  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsProcessing(true);
    try {
      await registerTeacher({
        name: newTeacher.name,
        email: newTeacher.email,
        phone: newTeacher.phone,
        subject: newTeacher.subject,
        password: newTeacher.password
      });
      
      // Refresh teachers list
      const teachersList = await getTeachers();
      setTeachers(teachersList);
      
      // Reset form and close modal
      setNewTeacher({
        name: '',
        email: '',
        phone: '',
        subject: '',
        password: 'default123',
        confirmPassword: 'default123'
      });
      setShowAddTeacherModal(false);
      
    } catch (error) {
      setError(error.message || 'Failed to add teacher');
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete teacher
  const handleDeleteTeacher = async (teacherId) => {
    if (!window.confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsProcessing(true);
      // Note: In a real app, you might want to deactivate instead of delete
      // to preserve data integrity
      await deleteDoc(doc(firestore, 'users', teacherId));
      
      // Refresh teachers list
      const teachersList = await getTeachers();
      setTeachers(teachersList);
      
    } catch (error) {
      setError(error.message || 'Failed to delete teacher');
    } finally {
      setIsProcessing(false);
      setTeacherToDelete(null);
    }
  };

  if (isLoading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="error-state">{error}</div>;

  // Function to handle teacher row click
  const handleTeacherClick = (teacherId) => {
    // You can implement a detailed view or edit functionality here
    console.log('Viewing teacher:', teacherId);
  };

  return (
    <div className="admin-container">
      {/* ===== Header ===== */}
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-actions">
          <div className="semester-toggle">
            <span>Semester Mode: </span>
            <button 
              className={`toggle-btn ${currentSemesterMode === 'odd' ? 'active' : ''}`}
              onClick={() => !isUpdatingSemester && currentSemesterMode !== 'odd' && handleSemesterModeToggle()}
              disabled={isUpdatingSemester}
            >
              Odd (1,3,5,7)
            </button>
            <button 
              className={`toggle-btn ${currentSemesterMode === 'even' ? 'active' : ''}`}
              onClick={() => !isUpdatingSemester && currentSemesterMode !== 'even' && handleSemesterModeToggle()}
              disabled={isUpdatingSemester}
            >
              Even (2,4,6,8)
            </button>
            {isUpdatingSemester && <span className="loading-text">Updating...</span>}
          </div>
          <button onClick={handleLogout} className="btn btn-logout">
            Logout
          </button>
        </div>
      </div>

      {/* ===== Teachers Section ===== */}
      <div className="admin-section">
        <div className="section-header">
          <div>
            <h2>Teachers</h2>
            <p>Manage all registered teachers and their details</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddTeacherModal(true)}
            disabled={isProcessing}
          >
            + Add New Teacher
          </button>
        </div>
        
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Subject</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length > 0 ? (
                teachers.map((teacher) => (
                  <tr key={teacher.id} onClick={() => handleTeacherClick(teacher.id)} className="clickable-row">
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {teacher.name?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <div className="user-name">{teacher.name || 'N/A'}</div>
                          <div className="user-email">{teacher.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{teacher.email || 'N/A'}</td>
                    <td>{teacher.phone || 'N/A'}</td>
                    <td>
                      <span className="subject-badge">
                        {teacher.subject || 'Not specified'}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <span className={`status-badge ${teacher.status === 'active' ? 'active' : 'inactive'}`}>
                          {teacher.status || 'inactive'}
                        </span>
                        <button 
                          className="btn-icon danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this teacher?')) {
                              handleDeleteTeacher(teacher.id);
                            }
                          }}
                          disabled={isProcessing}
                          title="Delete teacher"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    No teachers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Teacher Modal */}
      {showAddTeacherModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Teacher</h3>
              <button 
                className="close-btn"
                onClick={() => !isProcessing && setShowAddTeacherModal(false)}
                disabled={isProcessing}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddTeacher} className="modal-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={newTeacher.name}
                  onChange={handleNewTeacherChange}
                  className={formErrors.name ? 'error' : ''}
                  disabled={isProcessing}
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              </div>
              
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={newTeacher.email}
                  onChange={handleNewTeacherChange}
                  className={formErrors.email ? 'error' : ''}
                  disabled={isProcessing}
                />
                {formErrors.email && <span className="error-message">{formErrors.email}</span>}
              </div>
              
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={newTeacher.phone}
                  onChange={handleNewTeacherChange}
                  className={formErrors.phone ? 'error' : ''}
                  placeholder="e.g., 1234567890"
                  disabled={isProcessing}
                />
                {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
              </div>
              
              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={newTeacher.subject}
                  onChange={handleNewTeacherChange}
                  className={formErrors.subject ? 'error' : ''}
                  disabled={isProcessing}
                />
                {formErrors.subject && <span className="error-message">{formErrors.subject}</span>}
              </div>
              
              <div className="form-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddTeacherModal(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Adding...' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      {/* ===== Stats Section ===== */}
      <div className="stats-grid">
        <div className="stat-card">
          <UserIcon />
          <div>Total Teachers: {teachers.length}</div>
        </div>

        <div className="stat-card">
          <UserIcon />
          <div>Total Students: {students.length}</div>
        </div>

        <div className="stat-card">
          <AssignmentIcon />
          <div>Total Assignments: {assignments.length}</div>
        </div>

        <div className="stat-card">
          <ClockIcon />
          <div>Last Updated: {new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {/* ===== Teacher Form ===== */}
      {showTeacherForm && (
        <form onSubmit={(e) => e.preventDefault()} className="teacher-form">
          <div>
            <label>Teacher Name</label>
            <input name="name" value={formData.name} onChange={handleInputChange} />
          </div>
        </form>
      )}

      {/* ===== Student Form ===== */}
      {showStudentForm && (
        <form onSubmit={(e) => e.preventDefault()} className="student-form">
          <div>
            <label>Student Name</label>
            <input
              name="name"
              value={studentForm.name}
              onChange={(e) => handleStudentInputChange(e, "name")}
            />
          </div>
          <div>
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={studentForm.phone}
              onChange={(e) => handleStudentInputChange(e, "phone")}
              placeholder="e.g. 0300-1234567"
            />
          </div>
        </form>
      )}
    </div>
  );
}
