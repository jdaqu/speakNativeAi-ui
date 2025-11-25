'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { navigation } from '@/lib/navigation'
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle, LanguageSwitcherIcon } from '@/components/ui'
import { Brain, Eye, EyeOff, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { formatApiError } from '@/lib/utils'
import ResendVerificationModal from '@/components/ResendVerificationModal'
import { getApiBaseUrl } from '@/lib/api'

export default function LoginPage() {
  const t = useTranslations()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResendModal, setShowResendModal] = useState(false)
  const [isUnverifiedError, setIsUnverifiedError] = useState(false)

  const { login } = useAuth()

  const handleGoogleLogin = () => {
    const apiBaseUrl = getApiBaseUrl()
    window.location.href = `${apiBaseUrl}/v1/auth/google/login`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsUnverifiedError(false)

    // Validation
    if (password.length > 72) {
      setError(t('auth.login.passwordTooLong'))
      return
    }

    setIsLoading(true)

    try {
      await login(email, password)
      navigation.goto('/dashboard')
    } catch (err: unknown) {
      const errorMessage = formatApiError(err)
      setError(errorMessage)

      // Check if error is related to inactive/unverified account
      if (errorMessage.toLowerCase().includes('inactive') ||
          errorMessage.toLowerCase().includes('not active') ||
          errorMessage.toLowerCase().includes('verify')) {
        setIsUnverifiedError(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-end mb-4">
            <LanguageSwitcherIcon />
          </div>
          <a href={navigation.getHref('/')} className="inline-flex items-center space-x-2 mb-4">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">{t('common.appName')}</span>
          </a>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.login.title')}</h1>
          <p className="text-gray-600">{t('auth.login.subtitle')}</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('auth.login.signIn')}</CardTitle>
            <CardDescription>
              {t('auth.login.enterCredentials')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="space-y-3">
                  <div role="alert" data-testid="login-error" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>

                  {/* Resend Verification Button */}
                  {isUnverifiedError && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="flex items-start space-x-3">
                        <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-blue-900 mb-1">
                            Email Not Verified
                          </h4>
                          <p className="text-sm text-blue-700 mb-3">
                            Please verify your email address to log in. Check your inbox for the verification link.
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowResendModal(true)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                          >
                            Resend Verification Email
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  {t('common.email')}
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
                  {t('common.password')}
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('common.password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={72}
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('auth.login.signingIn') : t('auth.login.signIn')}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('auth.login.or')}</span>
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
              {t('auth.login.signInWithGoogle')}
            </Button>

            {/* Forgot Password Link */}
            <div className="mt-4 text-center">
              <a
                href={navigation.getHref('/forgot-password')}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
              >
                Forgot Password?
              </a>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {t('auth.login.noAccount')}{' '}
                <a href={navigation.getHref('/register')} className="text-primary hover:underline font-medium">
                  {t('auth.login.signUpHere')}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <a href={navigation.getHref('/')} className="text-sm text-gray-500 hover:text-gray-700">
            ← {t('common.backToHome')}
          </a>
        </div>
      </div>

      {/* Resend Verification Modal */}
      <ResendVerificationModal
        isOpen={showResendModal}
        onClose={() => setShowResendModal(false)}
        initialEmail={email}
      />
    </div>
  )
} 