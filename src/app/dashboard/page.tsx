'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Brain, User, LogOut, Languages, BookOpen } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Fix from './components/Fix'
import Translate from './components/Translate'
import Define from './components/Define'
import LearningPathViewer from './components/LearningPathViewer'
import { LearningToast } from '@/components/ui/learning-toast'

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('fix')

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
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
          <div className="lg:col-span-1">
            <LearningPathViewer />
          </div>
        </div>
      </main>
      <LearningToast />
    </div>
  )
} 