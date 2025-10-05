'use client'

import { useState, useMemo } from 'react'
import { Textarea, FormCard, SectionCard, FormalityBadge } from '@/components/ui'
import { Languages } from 'lucide-react'
import { InlineContextHint } from './shared/InlineContextHint'
import ExampleButtons from './shared/ExampleButtons'
import { learningApi } from '@/lib/api'
import { formatApiError, extractInlineContext } from '@/lib/utils'

interface TranslationAlternative {
  translation: string
  context: string
  formality_level: string
}

interface TranslateResponse {
  original_text: string
  primary_translation: string
  alternatives: TranslationAlternative[]
  explanation: string
}

export default function Translate() {
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<TranslateResponse | null>(null)
  const [error, setError] = useState('')

  // Example Spanish phrases to translate to English
  const examples = [
    {
      text: "Necesito enviar este correo a mi jefe mañana",
      description: "Professional email context"
    },
    {
      text: "Me gustaría agendar una reunión para la próxima semana",
      description: "Business scheduling"
    }
  ]

  // Cache inline context extraction to avoid recalculation
  const { text: extractedText, context: extractedContext } = useMemo(
    () => extractInlineContext(text.trim()),
    [text]
  )

  const sourceLanguage = 'Spanish'
  const targetLanguage = 'English'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!extractedText) return

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await learningApi.translate(
        extractedText,
        sourceLanguage,
        targetLanguage,
        extractedContext
      )
      setResult(response.data)
    } catch (err: unknown) {
      setError(formatApiError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setText('')
    setResult(null)
    setError('')
  }

  const handleExampleClick = (exampleText: string) => {
    setText(exampleText)
    setResult(null)
    setError('')
  }

  const getFormalityVariant = (level: string): 'formal' | 'informal' | 'neutral' => {
    const normalized = level.toLowerCase()
    if (['formal', 'informal'].includes(normalized)) {
      return normalized as 'formal' | 'informal'
    }
    return 'neutral' // default for casual and other levels
  }


  return (
    <div className="space-y-8">
      {/* Input Section */}
      <FormCard
        title="Translate Text"
        description="Translate text with context-aware alternatives and detailed explanations"
        primaryButton={{
          label: 'Translate',
          loadingLabel: 'Translating...',
          isLoading,
          isDisabled: !extractedText,
          form: 'translate-text-form',
          type: 'submit'
        }}
        secondaryButton={{
          label: 'Clear',
          onClick: handleReset,
          showWhen: !!result
        }}
        error={error}
      >
        <form id="translate-text-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text to translate (from Spanish to English)
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text you want to translate..."
              className="min-h-[100px] resize-vertical"
              disabled={isLoading}
            />
          </div>

          {/* Inline context hint */}
          <InlineContextHint context={extractedContext} />
        </form>

        {/* Example buttons */}
        <ExampleButtons 
          examples={examples}
          onExampleClick={handleExampleClick}
          disabled={isLoading}
        />
      </FormCard>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Primary Translation */}
          <SectionCard
            title="Primary Translation"
            icon={<Languages className="h-5 w-5" />}
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Original ({sourceLanguage}):
                </p>
                <p className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  {result.original_text}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Translation ({targetLanguage}):
                </p>
                <p className="p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 font-medium">
                  {result.primary_translation}
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Explanation */}
          {result.explanation && (
            <SectionCard title="Translation Notes">
              <p className="text-gray-700">{result.explanation}</p>
            </SectionCard>
          )}

          {/* Alternative Translations */}
          {result.alternatives.length > 0 && (
            <SectionCard
              title={`Alternative Translations (${result.alternatives.length})`}
              description="Different ways to express the same meaning with varying formality and context"
            >
              <div className="space-y-4">
                {result.alternatives.map((alt, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-md hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-lg flex-1">
                        {alt.translation}
                      </p>
                      <FormalityBadge level={getFormalityVariant(alt.formality_level)} className="ml-3" />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">Context:</p>
                      <p>{alt.context}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      )}
    </div>
  )
}
