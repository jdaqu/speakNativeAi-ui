'use client'

import { useAuth } from '@/lib/auth-context'
import { storage } from '@/lib/storage'
import { navigation } from '@/lib/navigation'
import { useEffect, useState } from 'react'
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { Brain, User, LogOut, Languages, BookOpen } from 'lucide-react'
import Fix from './components/Fix'
import Translate from './components/Translate'
import Define from './components/Define'

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('fix')
  const [debugInfo, setDebugInfo] = useState('')
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)
  const [hasToken, setHasToken] = useState(false)
  const [isElectron, setIsElectron] = useState(false)

  useEffect(() => {
    // Check for token on client side only
    if (typeof window !== 'undefined') {
      const token = storage.getToken()
      setHasToken(!!token)
      setIsElectron(!!(window as any).electronAPI?.isElectron)
      setDebugInfo(`Loading: ${isLoading}, Auth: ${isAuthenticated}, User: ${!!user}, Token: ${!!token}`)

      // Mark that we've checked auth at least once
      setTimeout(() => setHasCheckedAuth(true), 500)

      // Only redirect if we've had time to check auth and there's really no token
      const timer = setTimeout(() => {
        if (!isLoading && !isAuthenticated && !token) {
          navigation.goto('/login')
        }
      }, 2000) // Wait 2 seconds

      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, isLoading, user])

  // Show loading longer and don't redirect until we're sure
  if (!hasCheckedAuth || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
          <p className="mt-2 text-sm text-gray-400">{debugInfo}</p>
        </div>
      </div>
    )
  }

  // If we have a token but user hasn't loaded yet, keep loading
  if (hasToken && !user && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Authenticating...</p>
          <p className="mt-2 text-sm text-gray-400">{debugInfo}</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    navigation.goto('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
          <p className="mt-2 text-sm text-gray-400">{debugInfo}</p>
        </div>
      </div>
    )
  }

  // Only show "not authenticated" if we've checked everything and there's really no auth
  if (!isAuthenticated && !hasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Not authenticated, redirecting...</p>
          <p className="mt-2 text-sm text-gray-400">{debugInfo}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">SpeakNative AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">Welcome, {user?.username || 'User'}!</span>
            </div>
            {!isElectron && (
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fix">
                <Brain className="h-4 w-4 mr-2" />
                Fix My English
              </TabsTrigger>
              <TabsTrigger value="translate">
                <Languages className="h-4 w-4 mr-2" />
                Smart Translator
              </TabsTrigger>
              <TabsTrigger value="define">
                <BookOpen className="h-4 w-4 mr-2" />
                Word Definitions
              </TabsTrigger>
            </TabsList>
            <TabsContent value="fix" className="mt-6">
              <Fix />
            </TabsContent>
            <TabsContent value="translate" className="mt-6">
              <Translate />
            </TabsContent>
            <TabsContent value="define" className="mt-6">
              <Define />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
} 