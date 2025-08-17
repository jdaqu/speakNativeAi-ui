import { api } from './api'

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (userData: {
    email: string
    username: string
    password: string
    full_name?: string
    native_language?: string
    target_language?: string
  }) => api.post('/auth/register', userData),

  getMe: () => api.get('/auth/me'),

  refreshToken: () => api.post('/auth/refresh'),
}