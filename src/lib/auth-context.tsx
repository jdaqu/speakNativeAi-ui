'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { api } from './api'

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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = Cookies.get('access_token')
      if (token) {
        // Set the token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        // Get user info
        const response = await api.get('/auth/me')
        setUser(response.data)
      }
    } catch (error) {
      // Token is invalid, remove it
      Cookies.remove('access_token')
      delete api.defaults.headers.common['Authorization']
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { access_token } = response.data
      
      // Store token in cookie
      Cookies.set('access_token', access_token, { expires: 7 }) // 7 days
      
      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      // Get user info
      await checkAuth()
    } catch (error) {
      throw error
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      await api.post('/auth/register', userData)
      // After successful registration, log in the user
      await login(userData.email, userData.password)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    Cookies.remove('access_token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
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