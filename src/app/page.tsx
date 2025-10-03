'use client'

import { useAuth } from '@/lib/auth-context'
import { navigation } from '@/lib/navigation'
import { useEffect, useState } from 'react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui'
import { BookOpen, MessageCircle, Globe, Brain, Download, Monitor, Eye, EyeOff } from 'lucide-react'
import { formatApiError } from '@/lib/utils'
import { getDownloadUrls, DownloadUrls } from '@/lib/github-releases'

export default function HomePage() {
  const { isAuthenticated, isLoading, login } = useAuth()

  // Track if component has mounted to prevent SSR/hydration issues
  const [isMounted, setIsMounted] = useState(false)
  const [isElectron, setIsElectron] = useState(false)

  // Login form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Download URLs state
  const [downloadUrls, setDownloadUrls] = useState<DownloadUrls | null>(null)
  const [isLoadingDownloads, setIsLoadingDownloads] = useState(false)

  useEffect(() => {
    // Check Electron status on mount
    setIsMounted(true)
    setIsElectron(!!(window as unknown as { electronAPI?: { isElectron?: boolean } }).electronAPI?.isElectron)
  }, [])

  // Load download URLs when component mounts (only for web, not Electron)
  useEffect(() => {
    if (isMounted && !isElectron) {
      setIsLoadingDownloads(true)
      getDownloadUrls()
        .then(setDownloadUrls)
        .catch(() => {
          // Fallback to local files if GitHub API fails
          setDownloadUrls({
            macArm64: '/downloads/SpeakNativeAI-mac-arm64.dmg',
            macIntel: '/downloads/SpeakNativeAI-mac-intel.dmg',
            version: 'latest'
          })
        })
        .finally(() => setIsLoadingDownloads(false))
    }
  }, [isMounted, isElectron])

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigation.goto('/dashboard')
    }
  }, [isAuthenticated, isLoading])

  // Don't render anything until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigation.goto('/dashboard')
    } catch (err: unknown) {
      setLoginError(formatApiError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

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

  // If running in Electron, show login form instead of landing page
  if (isElectron) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-gray-900">SpeakNative AI</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-600">Sign in to continue your English learning journey</p>
          </div>

          {/* Login Form */}
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your email and password to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {loginError}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{' '}
                  <a href={navigation.getHref('/register')} className="text-primary hover:underline font-medium">
                    Sign up here
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
            <Button variant="ghost" asChild>
              <a href={navigation.getHref('/login')}>Login</a>
            </Button>
            <Button asChild>
              <a href={navigation.getHref('/register')}>Get Started</a>
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
          <Button size="lg" asChild>
            <a href={navigation.getHref('/register')}>Start Learning Free</a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href={navigation.getHref('/login')}>Sign In</a>
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

      {/* Download Desktop App Section - Only show on web, not in Electron */}
      {!isElectron && (
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Monitor className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get the Desktop App
            </h2>
            <p className="text-xl text-gray-600">
              Access SpeakNative AI instantly from anywhere with our desktop app.
              Use the global shortcut (Cmd+Shift+S / Ctrl+Shift+S) for quick corrections and translations.
            </p>
          </div>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="mb-4">
                    <svg className="h-12 w-12 mx-auto text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      variant="default" 
                      asChild
                      disabled={isLoadingDownloads || !downloadUrls}
                    >
                      <a 
                        href={downloadUrls?.macArm64 || '#'} 
                        download
                        onClick={(e) => {
                          if (!downloadUrls?.macArm64) {
                            e.preventDefault()
                          }
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {isLoadingDownloads ? 'Loading...' : 'Mac (Apple Silicon)'}
                      </a>
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="outline" 
                      asChild
                      disabled={isLoadingDownloads || !downloadUrls}
                    >
                      <a 
                        href={downloadUrls?.macIntel || '#'} 
                        download
                        onClick={(e) => {
                          if (!downloadUrls?.macIntel) {
                            e.preventDefault()
                          }
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {isLoadingDownloads ? 'Loading...' : 'Mac (Intel)'}
                      </a>
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    macOS 10.13+ {downloadUrls?.version && `• v${downloadUrls.version}`}
                  </p>
                </div>

                <div className="text-center">
                  <div className="mb-4">
                    <svg className="h-12 w-12 mx-auto text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M0,0V11H11V0ZM3.75,8.625l-1.5-1.5L3.375,6l1.5,1.5L8.625,3.75l1.125,1.125ZM13,0V11H24V0ZM21.75,4H15.25V2.75H21.75ZM0,13V24H11V13ZM3.75,21.625l-1.5-1.5L3.375,19l1.5,1.5L8.625,16.75l1.125,1.125ZM13,13V24H24V13ZM21.75,20H15.25V18.75H21.75Zm0-3.75H15.25V15H21.75Z"/>
                    </svg>
                  </div>
                  <Button className="w-full" variant="outline" disabled>
                    <Download className="mr-2 h-4 w-4" />
                    Coming Soon
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">Windows 10+</p>
                </div>

                <div className="text-center">
                  <div className="mb-4">
                    <svg className="h-12 w-12 mx-auto text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.84-.415 1.719-.485 2.617-.1 1.259.165 2.627.78 3.462.615.835 1.848 1.336 3.05 1.336 1.2 0 2.548-.5 3.278-1.336.73-.835.996-2.203.895-3.462-.07-.898-.207-1.777-.485-2.617-.59-1.771-1.831-3.47-2.716-4.521-.75-1.067-.974-1.928-1.05-3.02-.065-1.491 1.056-5.965-3.17-6.298-.165-.013-.325-.021-.48-.021zm11.5 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.84-.415 1.719-.485 2.617-.1 1.259.165 2.627.78 3.462.615.835 1.848 1.336 3.05 1.336 1.2 0 2.548-.5 3.278-1.336.73-.835.996-2.203.895-3.462-.07-.898-.207-1.777-.485-2.617-.59-1.771-1.831-3.47-2.716-4.521-.75-1.067-.974-1.928-1.05-3.02-.065-1.491 1.056-5.965-3.17-6.298-.165-.013-.325-.021-.48-.021z"/>
                    </svg>
                  </div>
                  <Button className="w-full" variant="outline" disabled>
                    <Download className="mr-2 h-4 w-4" />
                    Coming Soon
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">Ubuntu, Debian, Fedora</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Desktop App Features:</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  <li>• Global hotkey access (Cmd+Shift+S)</li>
                  <li>• Quick Fix, Translate & Define popup</li>
                  <li>• Works offline for cached content</li>
                  <li>• System tray integration</li>
                  <li>• Auto-updates for latest features</li>
                  <li>• Native OS integration</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      )}

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Improve Your English?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of learners who are already improving their English with AI
          </p>
          <Button size="lg" variant="secondary" asChild>
            <a href={navigation.getHref('/register')}>Start Your Journey</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 SpeakNative AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
