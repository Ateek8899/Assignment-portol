const STORAGE_KEY = 'currentUser'

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getSessionUser() {
  if (!isBrowser()) return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.error('Failed to read session user', error)
    return null
  }
}

export function setSessionUser(user) {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } catch (error) {
    console.error('Failed to persist session user', error)
  }
}

export function clearSessionUser() {
  if (!isBrowser()) return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear session user', error)
  }
}

export function getCurrentStudent() {
  const user = getSessionUser()
  return user?.role === 'student' ? user : null
}

export function getCurrentTeacher() {
  const user = getSessionUser()
  return user?.role === 'teacher' ? user : null
}

export function getCurrentAdmin() {
  const user = getSessionUser()
  return user?.role === 'admin' ? user : null
}
