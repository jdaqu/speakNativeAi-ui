'use client'

import { useSearchParams } from 'next/navigation'
import { navigation } from '@/lib/navigation'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Brain, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function OAuthErrorPage() {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || t('auth.oauth.error')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <a href={navigation.getHref('/')} className="inline-flex items-center space-x-2 mb-4">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">{t('common.appName')}</span>
          </a>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-center">{t('auth.oauth.errorTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">{message}</p>
            <Button
              className="w-full"
              onClick={() => navigation.goto('/login')}
            >
              {t('auth.login.signIn')}
            </Button>
            <div className="text-center">
              <a
                href={navigation.getHref('/')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← {t('common.backToHome')}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

