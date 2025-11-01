import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth'
import { auth, firestore } from './firebase'
import {
  clearSessionUser,
  getCurrentAdmin,
  getCurrentStudent,
  getCurrentTeacher,
  setSessionUser
} from './session'

const USERS_COLLECTION = 'users'
const ASSIGNMENTS_COLLECTION = 'assignments'
const SUBMISSIONS_COLLECTION = 'submissions'
const ADMIN_MESSAGES_COLLECTION = 'adminMessages'
const TEACHER_REQUESTS_COLLECTION = 'teacherRequests'
const SETTINGS_COLLECTION = 'settings'

const STUDENT_ROLE = 'student'
const TEACHER_ROLE = 'teacher'
const ADMIN_ROLE = 'admin'

function mapDoc(snapshot) {
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() }
}

function normalizeAuthError(error) {
  if (error && typeof error.code === 'string') {
    switch (error.code) {
      case 'auth/configuration-not-found':
        return new Error('Email/password sign-in is disabled for this Firebase project. Enable it in Firebase Console → Authentication → Sign-in method.')
      case 'auth/missing-email':
      case 'auth/invalid-email':
        return new Error('Please enter a valid email address.')
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return new Error('Incorrect email or password.')
      case 'auth/email-already-in-use':
        return new Error('This email is already registered.')
      default:
        break
    }
  }
  if (error instanceof Error) return error
  return new Error('Authentication failed. Please try again later.')
}

async function getUserProfile(uid) {
  const profileRef = doc(firestore, USERS_COLLECTION, uid)
  const snap = await getDoc(profileRef)
  return mapDoc(snap)
}

async function ensureUniqueStudentRoll(rollNo) {
  try {
    const studentsRef = collection(firestore, USERS_COLLECTION)
    const q = query(studentsRef, where('role', '==', STUDENT_ROLE), where('rollNo', '==', rollNo))
    const snap = await getDocs(q)
    if (!snap.empty) {
      throw new Error('This roll number is already registered')
    }
  } catch (error) {
    if (error?.code === 'permission-denied') {
      console.warn('Skipping roll uniqueness check due to permission rules. Consider relaxing Firestore rules for this query.', error)
      return
    }
    throw error
  }
}

async function ensureUniqueTeacherPhone(phone) {
  if (!phone) return
  try {
    const usersRef = collection(firestore, USERS_COLLECTION)
    const q = query(usersRef, where('role', '==', TEACHER_ROLE), where('phone', '==', phone))
    const snap = await getDocs(q)
    if (!snap.empty) {
      throw new Error('A teacher with this phone already exists')
    }
  } catch (error) {
    if (error?.code === 'permission-denied') {
      console.warn('Skipping phone uniqueness check due to permission rules. Consider relaxing Firestore rules for this query.', error)
      return
    }
    throw error
  }
}

export async function registerStudent({ name, className, semester, rollNo, phone, email, password }) {
  let credential
  try {
    credential = await createUserWithEmailAndPassword(auth, email, password)
    await ensureUniqueStudentRoll(rollNo)
    const profile = {
      role: STUDENT_ROLE,
      name,
      className,
      semester,
      rollNo,
      phone,
      email,
      createdAt: serverTimestamp()
    }
    await setDoc(doc(firestore, USERS_COLLECTION, credential.user.uid), profile)
    const session = { id: credential.user.uid, ...profile, createdAt: undefined }
    setSessionUser(session)
    return session
  } catch (error) {
    if (credential?.user) {
      try { await credential.user.delete() } catch (cleanupError) { console.warn('Failed to cleanup auth user after student registration error', cleanupError) }
    }
    throw normalizeAuthError(error)
  }
}

export async function loginStudent({ email, password }) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    const profile = await getUserProfile(credential.user.uid)
    if (!profile || profile.role !== STUDENT_ROLE) {
      await signOut(auth)
      throw new Error('No student account is associated with these credentials')
    }
    const session = { id: credential.user.uid, ...profile }
    setSessionUser(session)
    return session
  } catch (error) {
    if (credential?.user) {
      try { await credential.user.delete() } catch (cleanupError) { console.warn('Failed to cleanup auth user after teacher registration error', cleanupError) }
    }
    throw normalizeAuthError(error)
  }
}

export async function registerTeacher({ name, email, phone, subject, password }) {
  let credential
  try {
    credential = await createUserWithEmailAndPassword(auth, email, password)
    await ensureUniqueTeacherPhone(phone)
    const profile = {
      role: TEACHER_ROLE,
      name,
      email,
      phone,
      subject,
      createdAt: serverTimestamp()
    }
    await setDoc(doc(firestore, USERS_COLLECTION, credential.user.uid), profile)
    const session = { id: credential.user.uid, ...profile, createdAt: undefined }
    setSessionUser(session)
    return session
  } catch (error) {
    throw normalizeAuthError(error)
  }
}

export async function loginTeacher({ email, password }) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    const profile = await getUserProfile(credential.user.uid)
    if (!profile || profile.role !== TEACHER_ROLE) {
      await signOut(auth)
      throw new Error('No teacher account is associated with these credentials')
    }
    const session = { id: credential.user.uid, ...profile }
    setSessionUser(session)
    return session
  } catch (error) {
    throw normalizeAuthError(error)
  }
}

export async function loginAdmin({ email, password }) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    const profile = await getUserProfile(credential.user.uid)
    if (!profile || profile.role !== ADMIN_ROLE) {
      await signOut(auth)
      throw new Error('No admin account is associated with these credentials')
    }
    const session = { id: credential.user.uid, ...profile }
    setSessionUser(session)
    return session
  } catch (error) {
    throw normalizeAuthError(error)
  }
}

export async function logoutUser() {
  try {
    await signOut(auth)
  } catch (error) {
    // Ignore sign-out errors (e.g., no current user)
  }
  clearSessionUser()
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email)
}

export async function getStudents() {
  const usersRef = collection(firestore, USERS_COLLECTION)
  const q = query(usersRef, where('role', '==', STUDENT_ROLE), orderBy('name'))
  const snap = await getDocs(q)
  return snap.docs.map((docSnap) => mapDoc(docSnap))
}

export async function getTeachers() {
  const usersRef = collection(firestore, USERS_COLLECTION)
  const q = query(usersRef, where('role', '==', TEACHER_ROLE), orderBy('name'))
  const snap = await getDocs(q)
  return snap.docs.map((docSnap) => mapDoc(docSnap))
}

export async function getStudentById(id) {
  const snapshot = await getDoc(doc(firestore, USERS_COLLECTION, id))
  return mapDoc(snapshot)
}

export async function findTeacherByEmail(email) {
  const usersRef = collection(firestore, USERS_COLLECTION)
  const q = query(usersRef, where('role', '==', TEACHER_ROLE), where('email', '==', email))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return mapDoc(snap.docs[0])
}

export async function findTeacherByPhone(phone) {
  const usersRef = collection(firestore, USERS_COLLECTION)
  const q = query(usersRef, where('role', '==', TEACHER_ROLE), where('phone', '==', phone))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return mapDoc(snap.docs[0])
}

export async function addTeacherRequest(request) {
  const { password, ...safeRequest } = request
  const ref = await addDoc(collection(firestore, TEACHER_REQUESTS_COLLECTION), {
    ...safeRequest,
    status: 'pending',
    createdAt: serverTimestamp()
  })
  return { id: ref.id, ...safeRequest }
}

export async function addAssignment({
  teacherId,
  teacherName,
  teacherEmail,
  teacherPhone,
  subject,
  classOrCourse,
  semester,
  assignDate,
  dueDate,
  description
}) {
  const docRef = await addDoc(collection(firestore, ASSIGNMENTS_COLLECTION), {
    teacherId,
    teacherName,
    teacherEmail,
    teacherPhone,
    teacherIdentifier: teacherEmail || teacherPhone || teacherId,
    subject,
    classOrCourse,
    assignedDegree: classOrCourse,
    assignedSemester: semester,
    assignDate,
    dueDate,
    description,
    createdAt: serverTimestamp()
  })
  const snapshot = await getDoc(docRef)
  return mapDoc(snapshot)
}

export async function getAssignments() {
  const ref = collection(firestore, ASSIGNMENTS_COLLECTION)
  const q = query(ref, orderBy('dueDate'))
  const snap = await getDocs(q)
  return snap.docs.map((docSnap) => mapDoc(docSnap))
}

export async function getAssignmentsByTeacherIdentity(identity) {
  if (!identity) return []
  const ref = collection(firestore, ASSIGNMENTS_COLLECTION)
  const q = query(
    ref,
    where('teacherIdentifier', '==', identity)
  )
  const snap = await getDocs(q)
  if (!snap.empty) {
    return snap.docs.map((docSnap) => mapDoc(docSnap))
  }
  // Backwards compatibility: match email or phone fields
  const emailQ = query(ref, where('teacherEmail', '==', identity))
  const emailSnap = await getDocs(emailQ)
  if (!emailSnap.empty) {
    return emailSnap.docs.map((docSnap) => mapDoc(docSnap))
  }
  const phoneQ = query(ref, where('teacherPhone', '==', identity))
  const phoneSnap = await getDocs(phoneQ)
  return phoneSnap.docs.map((docSnap) => mapDoc(docSnap))
}

export async function getAssignmentById(id) {
  const snapshot = await getDoc(doc(firestore, ASSIGNMENTS_COLLECTION, id))
  return mapDoc(snapshot)
}

async function getSubmissionByAssignmentAndStudent({ assignmentId, studentId }) {
  const ref = collection(firestore, SUBMISSIONS_COLLECTION)
  const q = query(ref, where('assignmentId', '==', assignmentId), where('studentId', '==', studentId))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return mapDoc(snap.docs[0])
}

export async function addSubmission({ assignmentId, student, description, fileName, mimeType, dataUrl }) {
  const ref = await addDoc(collection(firestore, SUBMISSIONS_COLLECTION), {
    assignmentId,
    studentId: student.id,
    student,
    description,
    fileName,
    mimeType,
    dataUrl,
    submittedAt: serverTimestamp(),
    grade: null
  })
  const snapshot = await getDoc(ref)
  return mapDoc(snapshot)
}

export async function getSubmissionsByAssignment(assignmentId) {
  const ref = collection(firestore, SUBMISSIONS_COLLECTION)
  const q = query(ref, where('assignmentId', '==', assignmentId))
  const snap = await getDocs(q)
  return snap.docs.map((docSnap) => mapDoc(docSnap))
}

export async function updateSubmission(submissionId, data) {
  const ref = doc(firestore, SUBMISSIONS_COLLECTION, submissionId)
  await updateDoc(ref, data)
}

export async function getAssignmentsForStudent(student) {
  if (!student) return []
  const ref = collection(firestore, ASSIGNMENTS_COLLECTION)
  const filters = []
  if (student.className) {
    filters.push(where('assignedDegree', '==', student.className))
  }
  if (student.semester) {
    filters.push(where('assignedSemester', '==', student.semester))
  }
  const q = filters.length ? query(ref, ...filters) : query(ref)
  const snap = await getDocs(q)
  const assignments = snap.docs.map((docSnap) => mapDoc(docSnap))
  const results = []
  for (const assignment of assignments) {
    const submission = await getSubmissionByAssignmentAndStudent({ assignmentId: assignment.id, studentId: student.id })
    results.push({ ...assignment, submission })
  }
  return results
}

export async function addAdminMessage(message) {
  const ref = await addDoc(collection(firestore, ADMIN_MESSAGES_COLLECTION), {
    ...message,
    createdAt: serverTimestamp(),
    acks: []
  })
  const snapshot = await getDoc(ref)
  return mapDoc(snapshot)
}

export async function getAdminMessages() {
  const ref = collection(firestore, ADMIN_MESSAGES_COLLECTION)
  const q = query(ref, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((docSnap) => mapDoc(docSnap))
}

export async function ackAdminMessage(messageId, userId) {
  const ref = doc(firestore, ADMIN_MESSAGES_COLLECTION, messageId)
  await updateDoc(ref, {
    acks: arrayUnion(String(userId))
  })
}

export async function getSemesterMode() {
  const settingsRef = doc(firestore, SETTINGS_COLLECTION, 'general')
  const snapshot = await getDoc(settingsRef)
  if (!snapshot.exists()) {
    return 'odd'
  }
  const data = snapshot.data()
  return data.semesterMode || 'odd'
}

export async function setSemesterMode(mode) {
  const settingsRef = doc(firestore, SETTINGS_COLLECTION, 'general')
  await setDoc(settingsRef, { semesterMode: mode }, { merge: true })
}

export async function getDegreeRange(_degree, _semester) {
  // Degree range settings are not yet configured in Firestore. Placeholder for future usage.
  return null
}

export function currentStudent() {
  return getCurrentStudent()
}

export function currentTeacher() {
  return getCurrentTeacher()
}

export function currentAdmin() {
  return getCurrentAdmin()
}

export async function logoutStudent() {
  await logoutUser()
}

export async function logoutTeacher() {
  await logoutUser()
}

export async function logoutAdmin() {
  await logoutUser()
}

export const db = {
  currentStudent,
  currentTeacher,
  currentAdmin,
  getSemesterMode,
  getDegreeRange,
  getAssignmentsForStudent,
  getAssignmentsByTeacherIdentity,
  addAssignment,
  addSubmission,
  updateSubmission,
  getSubmissionsByAssignment,
  addAdminMessage,
  getAdminMessages,
  ackAdminMessage,
  findTeacherByEmail,
  findTeacherByPhone,
  logoutStudent,
  logoutTeacher,
  logoutAdmin
}
