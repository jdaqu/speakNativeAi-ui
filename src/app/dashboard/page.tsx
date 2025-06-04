'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, MessageCircle, Globe, BookOpen, User, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null // Will redirect to login
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
              <span className="text-sm text-gray-700">Welcome, {user.username}!</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.full_name || user.username}!
          </h1>
          <p className="text-gray-600">
            Ready to continue your English learning journey? Choose a learning mode below.
          </p>
        </div>

        {/* Learning Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/fix')}>
            <CardHeader>
              <MessageCircle className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Fix My English</CardTitle>
              <CardDescription>
                Write a sentence and get instant grammar corrections and improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={(e) => {
                e.stopPropagation()
                router.push('/dashboard/fix')
              }}>
                Start Fixing
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/translate')}>
            <CardHeader>
              <Globe className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Smart Translator</CardTitle>
              <CardDescription>
                Translate text with context and get multiple natural alternatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={(e) => {
                e.stopPropagation()
                router.push('/dashboard/translate')
              }}>
                Start Translating
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/define')}>
            <CardHeader>
              <BookOpen className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Word Definitions</CardTitle>
              <CardDescription>
                Look up words and build your vocabulary with detailed explanations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={(e) => {
                e.stopPropagation()
                router.push('/dashboard/define')
              }}>
                Look Up Words
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Native Language</CardDescription>
              <CardTitle className="text-lg">{user.native_language}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Learning</CardDescription>
              <CardTitle className="text-lg">{user.target_language}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Practice Sessions</CardDescription>
              <CardTitle className="text-lg">0</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Words Learned</CardDescription>
              <CardTitle className="text-lg">0</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest learning sessions and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity yet. Start learning to see your progress here!</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 