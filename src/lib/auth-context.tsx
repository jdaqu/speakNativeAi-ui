'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api'
import { storage } from './storage'

interface User {
  id: number
  email: string
  username: string
  full_name?: string
  native_language: string
  target_language: string
  is_active: boolean
  created_at: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

interface RegisterData {
  email: string
  username: string
  password: string
  full_name?: string
  native_language?: string
  target_language?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false) // Start as false for packaged app

  useEffect(() => {
    // Only check auth if we have a token, otherwise skip loading
    const initAuth = async () => {
      const token = await storage.getToken()
      if (token) {
        setIsLoading(true)
        await checkAuth()
      }
    }
    initAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = await storage.getToken()
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`

        // Add timeout for packaged app to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth check timeout')), 3000)
        )

        const authPromise = api.get('/auth/me')
        const response = await Promise.race([authPromise, timeoutPromise]) as { data: User }
        setUser(response.data)
      }
    } catch (err: unknown) {
      // Handle different types of errors gracefully
      const error = err as { message?: string }
      const errorMessage = error?.message || 'Unknown error'
      if (errorMessage.includes('Network Error') || errorMessage.includes('ECONNREFUSED')) {
        console.warn('Backend server not available. App will work in offline mode.')
      } else {
        console.log('Auth check failed:', errorMessage)
      }

      // Clear invalid tokens but don't fail completely
      await storage.removeToken()
      delete api.defaults.headers.common['Authorization']
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { access_token } = response.data

      // Store access token using universal storage
      await storage.setToken(access_token)
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

      await checkAuth()
    } catch (error: unknown) {
      // Provide user-friendly error messages
      const errorObj = error as { code?: string; message?: string }
      if (errorObj?.code === 'ECONNREFUSED' || errorObj?.message?.includes('Network Error')) {
        throw new Error('Cannot connect to server. Please make sure the backend is running.')
      }
      throw error
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      // Create account - user will need to verify email before logging in
      await api.post('/auth/register', userData)
      // Don't auto-login - user must verify email first
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout failed', error)
    } finally {
      await storage.removeToken()
      // refresh_token is HttpOnly and cleared by backend
      delete api.defaults.headers.common['Authorization']
      setUser(null)
    }
  }

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}