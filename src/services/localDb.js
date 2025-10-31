// Local storage keys
const STORAGE_KEYS = {
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  ASSIGNMENTS: 'assignments',
  CURRENT_USER: 'currentUser',
  ADMIN_SETTINGS: 'adminSettings',
  MESSAGES: 'adminMessages'
};

// ✅ Helper function to get data from localStorage
function getCollection(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : {};
}

// ✅ Helper function to save data to localStorage
function saveCollection(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Default admin user (for demo purposes only)
const DEFAULT_ADMIN = {
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin'
};

// ✅ Initialize default admin if not exists
function initializeDefaultAdmin() {
  const settings = getCollection(STORAGE_KEYS.ADMIN_SETTINGS);
  if (!settings.defaultAdminInitialized) {
    const adminUsers = getCollection('adminUsers') || {};
    adminUsers[DEFAULT_ADMIN.email] = {
      ...DEFAULT_ADMIN,
      password: 'admin123' // In a real app, this should be hashed
    };
    localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
    saveCollection(STORAGE_KEYS.ADMIN_SETTINGS, { ...settings, defaultAdminInitialized: true });
  }
}

// ✅ Initialize default admin on first load
initializeDefaultAdmin();

// ✅ Add student data
export const addStudent = async (studentData) => {
  try {
    const students = getCollection(STORAGE_KEYS.STUDENTS);
    const id = Date.now().toString();
    students[id] = { ...studentData, id };
    saveCollection(STORAGE_KEYS.STUDENTS, students);
    console.log("✅ Student added with ID:", id);
    return id;
  } catch (error) {
    console.error("❌ Error adding student:", error);
  }
};

// ✅ Get all students
export const getStudents = async () => {
  try {
    const students = getCollection(STORAGE_KEYS.STUDENTS);
    return Object.values(students);
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    return [];
  }
};

// ✅ Get a single student by ID
export const getStudentById = async (id) => {
  try {
    const students = getCollection(STORAGE_KEYS.STUDENTS);
    return students[id] || null;
  } catch (error) {
    console.error("❌ Error fetching student:", error);
    return null;
  }
};

// ✅ Add teacher data
export const addTeacher = async (teacherData) => {
  try {
    const teachers = getCollection(STORAGE_KEYS.TEACHERS);
    const id = Date.now().toString();
    teachers[id] = { ...teacherData, id };
    saveCollection(STORAGE_KEYS.TEACHERS, teachers);
    console.log("✅ Teacher added with ID:", id);
    return id;
  } catch (error) {
    console.error("❌ Error adding teacher:", error);
  }
};

// ✅ Get all teachers
export const getTeachers = async () => {
  try {
    const teachers = getCollection(STORAGE_KEYS.TEACHERS);
    // Ensure we always return an array, even if teachers is null/undefined
    if (!teachers || typeof teachers !== 'object') {
      console.log("ℹ️ No teachers found, initializing empty teachers object");
      saveCollection(STORAGE_KEYS.TEACHERS, {});
      return [];
    }
    const teachersList = Object.values(teachers);
    console.log(`📋 Found ${teachersList.length} teachers`);
    return teachersList;
  } catch (error) {
    console.error("❌ Error fetching teachers:", error);
    return [];
  }
};

// ✅ Add assignment
export const addAssignment = async (assignmentData) => {
  try {
    const assignments = getCollection(STORAGE_KEYS.ASSIGNMENTS);
    const id = Date.now().toString();
    assignments[id] = { ...assignmentData, id };
    saveCollection(STORAGE_KEYS.ASSIGNMENTS, assignments);
    console.log("✅ Assignment added with ID:", id);
    return id;
  } catch (error) {
    console.error("❌ Error adding assignment:", error);
  }
};

// Get all assignments
export const getAssignments = async () => {
  try {
    const assignments = getCollection(STORAGE_KEYS.ASSIGNMENTS);
    return Object.values(assignments);
  } catch (error) {
    console.error("❌ Error getting assignments:", error);
    return [];
  }
};

// Get assignments by teacher identity (email or phone)
export const getAssignmentsByTeacherIdentity = (identity) => {
  try {
    if (!identity) return [];
    const assignments = getCollection(STORAGE_KEYS.ASSIGNMENTS) || {};
    return Object.values(assignments).filter(assignment => 
      assignment.createdBy === identity || 
      assignment.teacherEmail === identity ||
      assignment.teacherPhone === identity
    );
  } catch (error) {
    console.error("❌ Error getting teacher assignments:", error);
    return [];
  }
};

// Test connection (optional)
console.log("✅ Using local storage database");

export function currentTeacher() {
  const user = getCurrentUser();
  return user?.role === 'teacher' ? user : null;
}

export function currentStudent() {
  const user = getCurrentUser();
  return user?.role === 'student' ? user : null;
}

export function currentAdmin() {
  const user = getCurrentUser();
  return user?.role === 'admin' ? user : null;
}

function getCurrentUser() {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// ✅ Admin functions
export const addAdminMessage = (message) => {
  try {
    const messages = getCollection(STORAGE_KEYS.MESSAGES) || [];
    const newMessage = {
      id: Date.now().toString(),
      ...message,
      createdAt: new Date().toISOString(),
      acks: []
    };
    messages.push(newMessage);
    saveCollection(STORAGE_KEYS.MESSAGES, messages);
    return newMessage;
  } catch (error) {
    console.error('Error adding admin message:', error);
    return null;
  }
};

export const ackAdminMessage = (messageId, userId) => {
  try {
    const messages = getCollection(STORAGE_KEYS.MESSAGES) || [];
    const updated = messages.map(msg => {
      if (msg.id === messageId && !msg.acks?.includes(userId)) {
        return {
          ...msg,
          acks: [...(msg.acks || []), userId]
        };
      }
      return msg;
    });
    saveCollection(STORAGE_KEYS.MESSAGES, updated);
  } catch (error) {
    console.error('Error acknowledging message:', error);
  }
};

export const getAdminMessages = () => {
  return getCollection(STORAGE_KEYS.MESSAGES) || [];
};

// Logout student
export function logoutStudent() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// ✅ Export db object for backward compatibility
export const db = {
  // Teacher related
  addTeacher,
  getTeachers,
  
  // Student related
  addStudent,
  getStudents,
  getStudentById,
  
  // Assignment related
  addAssignment,
  getAssignments,
  getAssignmentsByTeacherIdentity,
  
  // User management
  currentTeacher,
  currentStudent,
  currentAdmin,
  logoutStudent,
  
  // Admin features
  addAdminMessage,
  ackAdminMessage,
  getAdminMessages,
  
  // Settings
  getSemesterMode: () => {
    const settings = getCollection(STORAGE_KEYS.ADMIN_SETTINGS) || {};
    return settings.semesterMode || 'odd'; // Default to odd semesters
  },
  
  setSemesterMode: (mode) => {
    const settings = getCollection(STORAGE_KEYS.ADMIN_SETTINGS) || {};
    saveCollection(STORAGE_KEYS.ADMIN_SETTINGS, { ...settings, semesterMode: mode });
  }
};

export default {
  addTeacher,
  addStudent,
  getStudents,
  getStudentById,
  addTeacher,
  getTeachers,
  addAssignment,
  getAssignments,
  currentTeacher,
  currentStudent
};
