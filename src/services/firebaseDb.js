// ======================
// Firebase Imports
// ======================
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  setDoc 
} from "firebase/firestore";
import { firestore } from "./firebase";
import { clearSessionUser, setSessionUser } from "./session";

// ======================
// Constants (Collections)
// ======================
const COLLECTIONS = {
  USERS: "users",
  CLASSES: "classes",
  ASSIGNMENTS: "assignments",
  SUBMISSIONS: "submissions",
  NOTIFICATIONS: "notifications",
  CLASS_SETTINGS: "classSettings",
  TEACHER_REQUESTS: "teacherRequests"
};

// Lightweight student registration used by Register.jsx (no Firebase Auth)
export const registerStudent = async ({ name, className, semester, rollNo, phone, email, password }) => {
  try {
    const profile = {
      role: "student",
      name,
      className,
      semester,
      rollNo,
      phone,
      email,
      status: "active",
      createdAt: serverTimestamp()
    };
    const ref = await addDoc(collection(firestore, COLLECTIONS.USERS), profile);
    // Persist a minimal session
    setSessionUser({ id: ref.id, role: "student", name, email, className, semester, rollNo, phone, status: "active" });
    return { id: ref.id, ...profile };
  } catch (error) {
    handleError(error, "Failed to register student");
  }
};

export const registerTeacher = async ({ name, email, phone, subject, password }) => {
  try {
    const profile = {
      role: "teacher",
      name,
      email,
      phone,
      subject,
      status: "pending",
      createdAt: serverTimestamp()
    };
    const ref = await addDoc(collection(firestore, COLLECTIONS.USERS), profile);
    setSessionUser({ id: ref.id, role: "teacher", name, email, phone, subject, status: "pending" });
    return { id: ref.id, ...profile };
  } catch (error) {
    handleError(error, "Failed to register teacher");
  }
};

// ======================
// Utility Functions
// ======================
const mapDoc = (doc) => ({ id: doc.id, ...doc.data() });

const handleError = (error, message) => {
  console.error(`${message}:`, error);
  throw new Error(message);
};

// ======================
// User Management
// ======================
export const createUser = async (userData) => {
  try {
    const userRef = await addDoc(collection(firestore, COLLECTIONS.USERS), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: userRef.id, ...userData };
  } catch (error) {
    handleError(error, "Error creating user");
  }
};

export const getUserById = async (userId) => {
  try {
    const docRef = doc(firestore, COLLECTIONS.USERS, userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? mapDoc(docSnap) : null;
  } catch (error) {
    handleError(error, "Error fetching user");
  }
};

export const updateUser = async (userId, updates) => {
  try {
    const userRef = doc(firestore, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { id: userId, ...updates };
  } catch (error) {
    handleError(error, "Error updating user");
  }
};

// ======================
// Class Management
// ======================
export const createClass = async (classData) => {
  try {
    const classRef = await addDoc(collection(firestore, COLLECTIONS.CLASSES), {
      ...classData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: classRef.id, ...classData };
  } catch (error) {
    handleError(error, "Error creating class");
  }
};

export const getClassById = async (classId) => {
  try {
    const docRef = doc(firestore, COLLECTIONS.CLASSES, classId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? mapDoc(docSnap) : null;
  } catch (error) {
    handleError(error, "Error fetching class");
  }
};

// ======================
// Class Settings (Roll Number Ranges)
// ======================
export const setClassRollNumberRange = async (classId, startRoll, endRoll) => {
  try {
    const classRef = doc(firestore, COLLECTIONS.CLASS_SETTINGS, classId);
    await setDoc(classRef, {
      classId,
      startRoll: parseInt(startRoll, 10),
      endRoll: parseInt(endRoll, 10),
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { classId, startRoll, endRoll };
  } catch (error) {
    handleError(error, "Error setting roll number range");
  }
};

export const getClassRollNumberRange = async (classId) => {
  try {
    const docRef = doc(firestore, COLLECTIONS.CLASS_SETTINGS, classId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? mapDoc(docSnap) : null;
  } catch (error) {
    handleError(error, "Error fetching class roll number range");
  }
};

export const getAllClassSettings = async () => {
  try {
    const querySnapshot = await getDocs(collection(firestore, COLLECTIONS.CLASS_SETTINGS));
    return querySnapshot.docs.map(mapDoc);
  } catch (error) {
    handleError(error, "Error fetching all class settings");
  }
};

export const getDegreeRange = async (degree, semester) => {
  try {
    // Try exact match id: `${degree}-${semester}`
    const id1 = `${degree}-${semester}`;
    let snap = await getDoc(doc(firestore, COLLECTIONS.CLASS_SETTINGS, id1));
    if (snap.exists()) {
      const d = snap.data();
      return { start: d.startRoll, end: d.endRoll };
    }
    // Try degree only
    const id2 = String(degree);
    snap = await getDoc(doc(firestore, COLLECTIONS.CLASS_SETTINGS, id2));
    if (snap.exists()) {
      const d = snap.data();
      return { start: d.startRoll, end: d.endRoll };
    }
    // Fallback: search collection for first matching classId field
    const qs = await getDocs(collection(firestore, COLLECTIONS.CLASS_SETTINGS));
    const found = qs.docs
      .map(mapDoc)
      .find((x) => String(x.classId).toLowerCase() === String(degree).toLowerCase());
    if (found) return { start: found.startRoll, end: found.endRoll };
    return null;
  } catch (error) {
    handleError(error, "Error fetching degree range");
  }
};

// Delete a class settings document by its ID
export const deleteClassSettings = async (classId) => {
  try {
    await deleteDoc(doc(firestore, COLLECTIONS.CLASS_SETTINGS, classId));
    return { success: true, id: classId };
  } catch (error) {
    handleError(error, "Error deleting class settings");
  }
};

// ======================
// Teacher Approval System
// ======================
export const getPendingTeacherRequests = async () => {
  try {
    const q = query(
      collection(firestore, COLLECTIONS.USERS),
      where("role", "==", "teacher"),
      where("status", "==", "pending")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapDoc);
  } catch (error) {
    handleError(error, "Error fetching pending teacher requests");
  }
};

export const updateTeacherStatus = async (teacherId, status) => {
  try {
    const teacherRef = doc(firestore, COLLECTIONS.USERS, teacherId);
    await updateDoc(teacherRef, {
      status,
      updatedAt: serverTimestamp()
    });
    return { id: teacherId, status };
  } catch (error) {
    handleError(error, `Error updating teacher status to ${status}`);
  }
};

// ======================
// Assignment Management
// ======================
export const createAssignment = async (assignmentData) => {
  try {
    const assignmentRef = await addDoc(collection(firestore, COLLECTIONS.ASSIGNMENTS), {
      ...assignmentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: assignmentRef.id, ...assignmentData };
  } catch (error) {
    handleError(error, "Error creating assignment");
  }
};

export const getAssignmentsByTeacher = async (teacherId) => {
  try {
    const q = query(
      collection(firestore, COLLECTIONS.ASSIGNMENTS),
      where("teacherId", "==", teacherId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapDoc);
  } catch (error) {
    handleError(error, "Error fetching teacher's assignments");
  }
};

// ======================
// Submission Management
// ======================
export const submitAssignment = async (submissionData) => {
  try {
    const submissionRef = await addDoc(collection(firestore, COLLECTIONS.SUBMISSIONS), {
      ...submissionData,
      submittedAt: serverTimestamp(),
      status: "submitted"
    });
    return { id: submissionRef.id, ...submissionData };
  } catch (error) {
    handleError(error, "Error submitting assignment");
  }
};

export const getSubmissionsByAssignment = async (assignmentId) => {
  try {
    const q = query(
      collection(firestore, COLLECTIONS.SUBMISSIONS),
      where("assignmentId", "==", assignmentId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapDoc);
  } catch (error) {
    handleError(error, "Error fetching submissions");
  }
};

export const gradeSubmission = async (submissionId, grade, feedback) => {
  try {
    const submissionRef = doc(firestore, COLLECTIONS.SUBMISSIONS, submissionId);
    await updateDoc(submissionRef, {
      grade,
      feedback,
      gradedAt: serverTimestamp(),
      status: "graded"
    });
    return { id: submissionId, grade, feedback };
  } catch (error) {
    handleError(error, "Error grading submission");
  }
};

export const getAssignmentById = async (assignmentId) => {
  try {
    const ref = doc(firestore, COLLECTIONS.ASSIGNMENTS, assignmentId);
    const snap = await getDoc(ref);
    return snap.exists() ? mapDoc(snap) : null;
  } catch (error) {
    handleError(error, "Error fetching assignment by id");
  }
};

export const addSubmission = async (submissionData) => {
  return submitAssignment(submissionData);
};

export const getAssignmentsForStudent = async (studentId) => {
  const q = query(
    collection(firestore, "assignments"),
    where("studentId", "==", studentId)
  );

  const querySnapshot = await getDocs(q);
  const assignments = [];
  querySnapshot.forEach((doc) => {
    assignments.push({ id: doc.id, ...doc.data() });
  });

  return assignments;
};
// ======================
// Notification System
// ======================
export const createNotification = async (notificationData) => {
  try {
    const notificationRef = await addDoc(collection(firestore, COLLECTIONS.NOTIFICATIONS), {
      ...notificationData,
      read: false,
      createdAt: serverTimestamp()
    });
    return { id: notificationRef.id, ...notificationData };
  } catch (error) {
    handleError(error, "Error creating notification");
  }
};

export const getUserNotifications = async (userId) => {
  try {
    const q = query(
      collection(firestore, COLLECTIONS.NOTIFICATIONS),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapDoc);
  } catch (error) {
    handleError(error, "Error fetching notifications");
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(firestore, COLLECTIONS.NOTIFICATIONS, notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });
    return { id: notificationId, read: true };
  } catch (error) {
    handleError(error, "Error marking notification as read");
  }
};

// ======================
// Teacher Requests (used by Register.jsx)
// ======================
export const addTeacherRequest = async (request) => {
  try {
    const { password, ...safe } = request || {};
    const ref = await addDoc(collection(firestore, COLLECTIONS.TEACHER_REQUESTS), {
      ...safe,
      status: "pending",
      createdAt: serverTimestamp()
    });
    return { id: ref.id, ...safe, status: "pending" };
  } catch (error) {
    handleError(error, "Error submitting teacher request");
  }
};

// ======================
// Admin Dashboard helpers expected by UI
// ======================
export const getTeachers = async () => {
  try {
    const q = query(
      collection(firestore, COLLECTIONS.USERS),
      where("role", "==", "teacher")
    );
    const snap = await getDocs(q);
    return snap.docs.map(mapDoc);
  } catch (error) {
    handleError(error, "Error fetching teachers");
  }
};

export const getStudents = async () => {
  try {
    const q = query(
      collection(firestore, COLLECTIONS.USERS),
      where("role", "==", "student")
    );
    const snap = await getDocs(q);
    return snap.docs.map(mapDoc);
  } catch (error) {
    handleError(error, "Error fetching students");
  }
};

export const loginStudent = async ({ email, password }) => {
  try {
    const qy = query(
      collection(firestore, COLLECTIONS.USERS),
      where("role", "==", "student"),
      where("email", "==", email)
    );
    const snap = await getDocs(qy);
    const docSnap = snap.docs[0];
    if (!docSnap) throw new Error("Student not found");
    const user = mapDoc(docSnap);
    setSessionUser({
      id: user.id,
      role: "student",
      name: user.name,
      email: user.email,
      className: user.className,
      semester: user.semester,
      rollNo: user.rollNo,
      phone: user.phone,
      status: user.status || "active",
    });
    return user;
  } catch (error) {
    handleError(error, "Login failed");
  }
};

export const loginTeacher = async ({ email, password }) => {
  try {
    const qy = query(
      collection(firestore, COLLECTIONS.USERS),
      where("role", "==", "teacher"),
      where("email", "==", email)
    );
    const snap = await getDocs(qy);
    const docSnap = snap.docs[0];
    if (!docSnap) throw new Error("Teacher not found");
    const user = mapDoc(docSnap);
    setSessionUser({
      id: user.id,
      role: "teacher",
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status || "pending",
    });
    return user;
  } catch (error) {
    handleError(error, "Login failed");
  }
};

export const resetPassword = async (email) => {
  return true;
};

export const getAssignments = async () => {
  try {
    // Order by createdAt when available
    let col = collection(firestore, COLLECTIONS.ASSIGNMENTS);
    let qy;
    try {
      qy = query(col, orderBy("createdAt", "desc"));
    } catch (_) {
      qy = query(col);
    }
    const snap = await getDocs(qy);
    return snap.docs.map(mapDoc);
  } catch (error) {
    handleError(error, "Error fetching assignments");
  }
};

export const logoutAdmin = async () => {
  try {
    // If auth sign-out is needed, it can be added; for now, clear local session
    clearSessionUser();
  } catch (_) {
    // ignore
  }
};

// ======================
// Approve/Reject wrappers used by TeacherApproval.jsx
// ======================
export const approveTeacher = async (teacherId, adminId) => {
  try {
    const teacherRef = doc(firestore, COLLECTIONS.USERS, teacherId);
    await updateDoc(teacherRef, {
      status: "approved",
      approved: true,
      approvedBy: adminId || null,
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: teacherId, status: "approved" };
  } catch (error) {
    handleError(error, "Error approving teacher");
  }
};

export const rejectTeacher = async (teacherId, adminId, reason = "") => {
  try {
    const teacherRef = doc(firestore, COLLECTIONS.USERS, teacherId);
    await updateDoc(teacherRef, {
      status: "rejected",
      approved: false,
      rejectedBy: adminId || null,
      rejectedAt: serverTimestamp(),
      rejectReason: reason || null,
      updatedAt: serverTimestamp()
    });
    return { id: teacherId, status: "rejected" };
  } catch (error) {
    handleError(error, "Error rejecting teacher");
  }
};


export const logoutStudent = async () => {
  try {
    await signOut(auth);
    console.log("Student logged out successfully");
  } catch (error) {
    console.error("Error logging out student:", error);
  }
};
// ======================
// Compatibility Aliases (used by TeacherGrading.jsx)
// ======================
export const getTeacherAssignments = getAssignmentsByTeacher;
export const updateSubmissionGrade = gradeSubmission;
export const getStudentById = getUserById;

export const currentTeacher = () => null;
export const findTeacherByEmail = async (email) => {
  try {
    const qy = query(
      collection(firestore, COLLECTIONS.USERS),
      where("role", "==", "teacher"),
      where("email", "==", email)
    );
    const snap = await getDocs(qy);
    return snap.docs[0] ? mapDoc(snap.docs[0]) : null;
  } catch (error) {
    handleError(error, "Error finding teacher by email");
  }
};
export const findTeacherByPhone = async (phone) => {
  try {
    const qy = query(
      collection(firestore, COLLECTIONS.USERS),
      where("role", "==", "teacher"),
      where("phone", "==", phone)
    );
    const snap = await getDocs(qy);
    return snap.docs[0] ? mapDoc(snap.docs[0]) : null;
  } catch (error) {
    handleError(error, "Error finding teacher by phone");
  }
};
export const getAssignmentsByTeacherIdentity = async (identity) => [];
export const getAdminMessages = async () => [];
export const getSemesterMode = async () => "odd";
export const addAssignment = async (assignmentData) => {
  return createAssignment(assignmentData);
};
export const logoutTeacher = async () => {
  try {
    clearSessionUser();
  } catch (_) {}
};
export const ackAdminMessage = async (messageId, identity) => ({ id: messageId, ackedBy: identity });
export const updateSubmission = async (submissionId, updates) => {
try {
const ref = doc(firestore, COLLECTIONS.SUBMISSIONS, submissionId);
await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
return { id: submissionId, ...updates };
} catch (error) {
handleError(error, "Error updating submission");
}
};

// Export all functions for easier imports
export default {
// User Management
createUser,
getUserById,
updateUser,

// Class Management
createClass,
getClassById,

// Class Settings
setClassRollNumberRange,
getClassRollNumberRange,
getAllClassSettings,
getDegreeRange,
deleteClassSettings,

// Teacher Approval
getPendingTeacherRequests,
updateTeacherStatus,
approveTeacher,
rejectTeacher,
addTeacherRequest,

// Assignment Management
createAssignment,
getAssignmentsByTeacher,
getTeacherAssignments,
addAssignment,
getAssignmentsByTeacherIdentity,
getAssignmentById,

// Submission Management
submitAssignment,
addSubmission,
getSubmissionsByAssignment,
gradeSubmission,
updateSubmissionGrade,
updateSubmission,

// Notifications
createNotification,
getUserNotifications,
markNotificationAsRead,

// Admin Dashboard helpers
getTeachers,
getStudents,
getAssignments,
logoutAdmin,
loginTeacher,
loginStudent,
resetPassword,
logoutTeacher,
getAdminMessages,
ackAdminMessage,
getSemesterMode,

// Aliases
getStudentById,
findTeacherByEmail,
findTeacherByPhone,
currentTeacher
};