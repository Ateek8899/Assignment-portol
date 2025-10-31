import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../services/localDb";
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
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/admin-login");
      return;
    }

    const loadData = async () => {
      try {
        const [teachersData, studentsData, assignmentsData] = await Promise.all([
          db.getTeachers(),
          db.getStudents(),
          db.getAssignments(),
        ]);
        setTeachers(teachersData || []);
        setStudents(studentsData || []);
        setAssignments(assignmentsData || []);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

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
    localStorage.removeItem("currentUser");
    navigate("/admin-login");
  };

  if (isLoading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="admin-container">
      {/* ===== Header ===== */}
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>

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
        </form>
      )}
    </div>
  );
}
