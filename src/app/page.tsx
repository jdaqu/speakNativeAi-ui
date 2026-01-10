'use client'

import { useAuth } from '@/lib/auth-context'
import { navigation } from '@/lib/navigation'
import { useEffect, useState } from 'react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, LanguageSwitcher } from '@/components/ui'
import { BookOpen, MessageCircle, Globe, Brain, Download, Monitor, Eye, EyeOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { formatApiError } from '@/lib/utils'
import { getDownloadUrls, DownloadUrls } from '@/lib/github-releases'
import { getApiBaseUrl } from '@/lib/api'

export default function HomePage() {
  const t = useTranslations()
  const { isAuthenticated, isLoading, login, handleOAuthCallback } = useAuth()

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

  useEffect(() => {
    // Set up OAuth callback listener for Electron
    if (isElectron && window.electronAPI?.onOAuthCallback) {
      const handleElectronOAuth = async (data: { success: boolean; accessToken?: string; error?: string }) => {
        if (data.success && data.accessToken) {
          try {
            await handleOAuthCallback(data.accessToken)
            navigation.goto('/dashboard')
          } catch (err) {
            setLoginError(formatApiError(err))
          }
        } else {
          setLoginError(data.error || 'OAuth authentication failed')
        }
      }

      (window as unknown as { electronAPI: { onOAuthCallback: (callback: (data: { success: boolean; accessToken?: string; error?: string }) => void) => void } }).electronAPI.onOAuthCallback(handleElectronOAuth)

      // Cleanup listener on unmount
      return () => {
        if ((window as unknown as { electronAPI?: { removeOAuthListener?: () => void } }).electronAPI?.removeOAuthListener) {
          (window as unknown as { electronAPI: { removeOAuthListener: () => void } }).electronAPI.removeOAuthListener()
        }
      }
    }
  }, [isElectron, handleOAuthCallback])

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

  const handleGoogleLogin = () => {
    const apiBaseUrl = getApiBaseUrl()
        
    if (isElectron && window.electronAPI?.openGoogleLogin) {
      // Use Electron's OAuth flow
      ;(window as unknown as { electronAPI: { openGoogleLogin: (apiBaseUrl: string) => Promise<boolean> } }).electronAPI.openGoogleLogin(apiBaseUrl)
    } else {
      // Use web OAuth flow
      window.location.href = `${apiBaseUrl}/v1/auth/google/login`
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

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>

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
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">{t('common.appName')}</span>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Button variant="ghost" asChild>
              <a href={navigation.getHref('/login')}>{t('landing.header.login')}</a>
            </Button>
            <Button asChild>
              <a href={navigation.getHref('/register')}>{t('landing.header.getStarted')}</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background with gradient and floating elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8 animate-fade-in">
            <Brain className="h-4 w-4 mr-2" />
            {t('landing.hero.badge')}
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight animate-slide-up">
            {t('landing.hero.title')}{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('landing.hero.titleHighlight')}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
            {t('landing.hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{animationDelay: '0.4s'}}>
            <Button size="lg" className="text-lg px-8 py-4 h-auto shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" asChild>
              <a href={navigation.getHref('/register')}>
                {t('landing.hero.ctaFree')}
                <span className="ml-2">→</span>
              </a>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto border-2 hover:bg-gray-50 transition-all duration-300" asChild>
              <a href={navigation.getHref('/login')}>{t('landing.hero.ctaSignIn')}</a>
            </Button>
          </div>
          
          {/* Desktop App Quick Access */}
          <div className="mt-16 p-4 md:p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.6s'}}>
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4 text-center sm:text-left">
              <Monitor className="h-8 w-8 text-blue-600 mr-0 sm:mr-3 mb-2 sm:mb-0" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">{t('landing.desktopBadge.title')}</h3>
            </div>
            <p className="text-gray-600 mb-4 text-center sm:text-left">{t('landing.desktopBadge.description')}</p>
            <div className="flex justify-center">
              <Button variant="secondary" size="sm" className="animate-bounce">
                <Download className="h-4 w-4 mr-2" />
                {t('landing.desktopBadge.download')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Problem Side */}
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-red-800 text-sm font-medium mb-4">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  The Current Problem
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Tired of the ChatGPT Dance?
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-red-600 text-sm">✗</span>
                    </div>
                    <p className="text-gray-600">Open ChatGPT → Write prompt → Paste text → Wait → Copy result</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-red-600 text-sm">✗</span>
                    </div>
                    <p className="text-gray-600">Corrections disappear after use - no learning happens</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-red-600 text-sm">✗</span>
                    </div>
                    <p className="text-gray-600">Generic examples don&apos;t match your real writing patterns</p>
                  </div>
                </div>
              </div>

              {/* Solution Side */}
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-4">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Our Solution
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  One-Click Corrections + Automatic Learning
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <p className="text-gray-600">Instant corrections in ≤30 seconds with global hotkey</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <p className="text-gray-600">Every mistake automatically saved and tracked</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <p className="text-gray-600">Personalized practice from your actual writing patterns</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Turn Your Writing Into Learning
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every correction, translation, and vocabulary lookup automatically builds your personalized learning path
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Instant Fix + Track</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Get corrections in ≤30 seconds while every mistake is automatically saved for your learning path
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  One-click grammar corrections
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Mistakes automatically tracked
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Personalized practice generated
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Smart Translation</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Context-aware translations that learn from your specific language patterns and needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Context-aware translations
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Your vocabulary patterns tracked
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Personalized word suggestions
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Personal Learning Path</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Automatically generated study materials based on your real writing mistakes and patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Practice from your own mistakes
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Vocabulary you actually use
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Grammar patterns you struggle with
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Workflow Demo Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How It Works in 30 Seconds
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how easy it is to get corrections while building your learning path
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                    1
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">⚡</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Press Cmd+Shift+S</h3>
                <p className="text-gray-600">Global hotkey opens the app instantly, anywhere on your computer</p>
              </div>

              {/* Step 2 */}
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">⚡</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Paste Your Text</h3>
                <p className="text-gray-600">Get instant corrections, translations, or vocabulary help in seconds</p>
              </div>

              {/* Step 3 */}
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                    3
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">⚡</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Learn Automatically</h3>
                <p className="text-gray-600">Every interaction builds your personalized learning path and practice materials</p>
              </div>
            </div>
            
            {/* Video Demo */}
            <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">See It In Action</h3>
                <p className="text-gray-600">Watch how easy it is to get corrections while building your learning path</p>
              </div>
              
              {/* Video Container */}
              <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  {/* Placeholder for video - you can replace this with actual video */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2">Demo Video Coming Soon</h4>
                    <p className="text-gray-300 mb-4">Watch the 30-second workflow in action</p>
                    <div className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      Play Demo
                    </div>
                  </div>
                </div>
                
                {/* Video Controls Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                    <div className="text-white text-sm font-medium">0:30</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                    <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* Video Description */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  <span className="font-semibold">What you&apos;ll see:</span> Real-time correction of an email,
                  automatic mistake tracking, and personalized practice generation - all in under 30 seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Desktop App Section - Only show on web, not in Electron */}
      {!isElectron && (
      <section className="relative py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <Monitor className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Get the{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Desktop App
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Access SpeakNative AI instantly from anywhere with our desktop app.
              <br />
              <span className="text-lg text-blue-200">Use the global shortcut (Cmd+Shift+S / Ctrl+Shift+S) for quick corrections and translations.</span>
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="text-center group">
                  <div className="mb-6">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">macOS</h3>
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300" 
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
                        <Download className="mr-2 h-5 w-5" />
                        {isLoadingDownloads ? 'Loading...' : 'Mac (Apple Silicon)'}
                      </a>
                    </Button>
                    <Button 
                      className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white/50 transition-all duration-300" 
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
                        <Download className="mr-2 h-5 w-5" />
                        {isLoadingDownloads ? 'Loading...' : 'Mac (Intel)'}
                      </a>
                    </Button>
                  </div>
                  <p className="text-sm text-blue-200 mt-4">
                    macOS 10.13+ {downloadUrls?.version && `• v${downloadUrls.version}`}
                  </p>
                </div>

                <div className="text-center group">
                  <div className="mb-6">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M0,0V11H11V0ZM3.75,8.625l-1.5-1.5L3.375,6l1.5,1.5L8.625,3.75l1.125,1.125ZM13,0V11H24V0ZM21.75,4H15.25V2.75H21.75ZM0,13V24H11V13ZM3.75,21.625l-1.5-1.5L3.375,19l1.5,1.5L8.625,16.75l1.125,1.125ZM13,13V24H24V13ZM21.75,20H15.25V18.75H21.75Zm0-3.75H15.25V15H21.75Z"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Windows</h3>
                  <Button className="w-full bg-white/10 text-white border border-white/30 cursor-not-allowed opacity-50" disabled>
                    <Download className="mr-2 h-5 w-5" />
                    Coming Soon
                  </Button>
                  <p className="text-sm text-blue-200 mt-4">Windows 10+</p>
                </div>

                <div className="text-center group">
                  <div className="mb-6">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.84-.415 1.719-.485 2.617-.1 1.259.165 2.627.78 3.462.615.835 1.848 1.336 3.05 1.336 1.2 0 2.548-.5 3.278-1.336.73-.835.996-2.203.895-3.462-.07-.898-.207-1.777-.485-2.617-.59-1.771-1.831-3.47-2.716-4.521-.75-1.067-.974-1.928-1.05-3.02-.065-1.491 1.056-5.965-3.17-6.298-.165-.013-.325-.021-.48-.021zm11.5 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.84-.415 1.719-.485 2.617-.1 1.259.165 2.627.78 3.462.615.835 1.848 1.336 3.05 1.336 1.2 0 2.548-.5 3.278-1.336.73-.835.996-2.203.895-3.462-.07-.898-.207-1.777-.485-2.617-.59-1.771-1.831-3.47-2.716-4.521-.75-1.067-.974-1.928-1.05-3.02-.065-1.491 1.056-5.965-3.17-6.298-.165-.013-.325-.021-.48-.021z"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Linux</h3>
                  <Button className="w-full bg-white/10 text-white border border-white/30 cursor-not-allowed opacity-50" disabled>
                    <Download className="mr-2 h-5 w-5" />
                    Coming Soon
                  </Button>
                  <p className="text-sm text-blue-200 mt-4">Ubuntu, Debian, Fedora</p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">Desktop App Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-blue-100">Global hotkey access (Cmd+Shift+S)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-blue-100">Quick Fix, Translate & Define popup</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-blue-100">Works offline for cached content</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-blue-100">System tray integration</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                    <span className="text-blue-100">Auto-updates for latest features</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                    <span className="text-blue-100">Native OS integration</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Loved by English Learners Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our users are saying about their learning experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    M
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Maria Santos</h4>
                    <p className="text-sm text-gray-600">Software Engineer, Brazil</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  &quot;Finally, I can fix my emails without the ChatGPT hassle! The app tracks my mistakes and creates practice exercises from my actual writing patterns. Game changer for work.&quot;
                </p>
                <div className="flex text-yellow-400 mt-4">
                  {'★'.repeat(5)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    A
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Ahmed Hassan</h4>
                    <p className="text-sm text-gray-600">Student, Egypt</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  &quot;As a PhD student, I write constantly in English. The desktop app with Cmd+Shift+S saves me hours every week. Plus, I&apos;m actually learning from my mistakes now!&quot;
                </p>
                <div className="flex text-yellow-400 mt-4">
                  {'★'.repeat(5)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    Y
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">Yuki Tanaka</h4>
                    <p className="text-sm text-gray-600">Marketing Manager, Japan</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  &quot;I work in a global company and need to communicate professionally. SpeakNative AI learns my communication style and helps me sound more natural. The personalized learning is brilliant!&quot;
                </p>
                <div className="flex text-yellow-400 mt-4">
                  {'★'.repeat(5)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Stop the ChatGPT Dance
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto">
            Join professionals and students who are learning from their own mistakes while getting instant corrections
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="text-lg px-8 py-4 h-auto bg-white text-blue-600 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300" asChild>
              <a href={navigation.getHref('/register')}>
                Start Your Journey
                <span className="ml-2">→</span>
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto border-2 border-white text-blue-600 hover:bg-white hover:text-blue-600 transition-all duration-300" asChild>
              <a href={navigation.getHref('/login')}>Sign In</a>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">≤30s</div>
              <div className="text-blue-200">Average Correction Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">100%</div>
              <div className="text-blue-200">Mistakes Automatically Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">∞</div>
              <div className="text-blue-200">Personalized Learning Paths</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>{t('landing.footer.copyright')}</p>
        </div>
      </footer>
    </div>
  )
}
