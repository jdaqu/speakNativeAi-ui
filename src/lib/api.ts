import axios from 'axios'
import { storage } from './storage'

// Detect if running in Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron

const getBaseURL = () => {
  if (isElectron) {
    // Use the API URL from preload script if available
    if (typeof window !== 'undefined' && window.electronAPI?.getApiBaseUrl) {
      return window.electronAPI.getApiBaseUrl() + '/v1'
    }
    return 'http://localhost:8000/api/v1'
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  }
  // Fallback for non-docker local development
  return 'http://localhost:8000/api/v1'
}

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // send/receive cookies for refresh flow
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = storage.getTokenSync()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string | null) => void; reject: (error: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token
            return axios(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Don't check for refresh token cookie since it's HttpOnly
        // Just attempt refresh - backend will use HttpOnly cookie
        const response = await api.post('/auth/refresh')
        const { access_token } = response.data

        storage.setToken(access_token)
        api.defaults.headers.common['Authorization'] = 'Bearer ' + access_token
        originalRequest.headers['Authorization'] = 'Bearer ' + access_token
        processQueue(null, access_token)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        logout()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export const logout = () => {
  isRefreshing = false
  failedQueue = []
  storage.removeToken()
  // refresh_token is HttpOnly and cleared by backend
  delete api.defaults.headers.common['Authorization']
}

// API functions for learning features
export const learningApi = {
  fixPhrase: (phrase: string, context?: string) =>
    api.post('/learning/fix', { phrase, context }),

  translate: (
    phrase: string,
    source_language = 'Spanish',
    target_language = 'English',
    context?: string
  ) =>
    api.post('/learning/translate', {
      phrase,
      source_language,
      target_language,
      context,
    }),

  define: (word: string, context?: string) =>
    api.post('/learning/define', { word, context }),
}