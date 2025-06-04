'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, MessageCircle, Globe, Brain } from 'lucide-react'

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">SpeakNative AI</span>
          </div>
          <div className="space-x-4">
            <Button variant="ghost" onClick={() => router.push('/login')}>
              Login
            </Button>
            <Button onClick={() => router.push('/register')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Master English with AI-Powered Learning
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Transform your English skills with personalized AI feedback. Get grammar corrections, 
          vocabulary suggestions, and track your progress as you learn.
        </p>
        <div className="space-x-4">
          <Button size="lg" onClick={() => router.push('/register')}>
            Start Learning Free
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.push('/login')}>
            Sign In
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How SpeakNative AI Helps You Learn
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <MessageCircle className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Fix Your Phrases</CardTitle>
              <CardDescription>
                Write in English and get instant corrections with detailed explanations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Grammar error detection</li>
                <li>• Style improvements</li>
                <li>• Native-like suggestions</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Smart Translation</CardTitle>
              <CardDescription>
                Translate with context and get multiple alternatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Context-aware translations</li>
                <li>• Formality levels</li>
                <li>• Cultural insights</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Vocabulary Builder</CardTitle>
              <CardDescription>
                Learn new words and track your vocabulary growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Personalized word lists</li>
                <li>• Progress tracking</li>
                <li>• Spaced repetition</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Improve Your English?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of learners who are already improving their English with AI
          </p>
          <Button size="lg" variant="secondary" onClick={() => router.push('/register')}>
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 SpeakNative AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
