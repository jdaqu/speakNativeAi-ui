import axios from 'axios'

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: '/api', // This will be proxied to http://localhost:8000/api
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Token will be set by auth context when needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - handled by auth context
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API functions for learning features
export const learningApi = {
  fixPhrase: (phrase: string) => 
    api.post('/fix', { phrase }),

  translate: (text: string, source_language = 'Spanish', target_language = 'English') =>
    api.post('/translate', { text, source_language, target_language }),

  define: (word: string, context?: string) =>
    api.post('/define', { word, context }),
}

// API functions for authentication
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
} 