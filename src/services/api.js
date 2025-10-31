import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true
})

// Example endpoints
export const AuthAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me')
}

export const AssignmentAPI = {
  list: () => api.get('/assignments'),
  detail: (id) => api.get(`/assignments/${id}`),
  create: (data) => api.post('/assignments', data),
  submit: (id, formData) => api.post(`/assignments/${id}/submit`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  grade: (id, data) => api.post(`/assignments/${id}/grade`, data)
}

export default api
