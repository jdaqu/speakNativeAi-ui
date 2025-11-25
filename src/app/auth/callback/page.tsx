'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { navigation } from '@/lib/navigation'
import { Card, CardContent } from '@/components/ui'
import { Brain } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function OAuthCallbackPage() {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const { handleOAuthCallback } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const hasProcessed = useRef(false)

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) {
      return
    }

    const processCallback = async () => {
      hasProcessed.current = true

      try {
        // Extract token from URL
        const accessToken = searchParams.get('access_token')

        if (!accessToken) {
          setError('No access token received')
          setTimeout(() => {
            navigation.goto('/login?error=oauth_failed')
          }, 2000)
          return
        }

        // Handle OAuth callback
        await handleOAuthCallback(accessToken)

        // Redirect to dashboard on success
        navigation.goto('/dashboard')
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
        setError(errorMessage)
        setTimeout(() => {
          navigation.goto('/login?error=oauth_failed')
        }, 3000)
      }
    }

    processCallback()
  }, [searchParams, handleOAuthCallback])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Brain className="h-12 w-12 text-primary animate-pulse" />
              </div>
              {error ? (
                <>
                  <h2 className="text-xl font-bold text-gray-900">
                    {t('auth.oauth.errorTitle')}
                  </h2>
                  <p className="text-gray-600">{error}</p>
                  <p className="text-sm text-gray-500">
                    Redirecting to login page...
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900">
                    {t('auth.oauth.completingSignIn')}
                  </h2>
                  <p className="text-gray-600">
                    Please wait while we complete your sign in...
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

