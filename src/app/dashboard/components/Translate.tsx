'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Languages } from 'lucide-react'
import { learningApi } from '@/lib/api'
import { formatApiError, extractInlineContext } from '@/lib/utils'
import { learningPath } from '@/lib/learning-path'
import { showLearningToast } from '@/components/ui/learning-toast'

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

  const sourceLanguage = 'Spanish'
  const targetLanguage = 'English'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { text: cleanText, context } = extractInlineContext(text.trim())
    if (!cleanText) return

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await learningApi.translate(
        cleanText,
        sourceLanguage,
        targetLanguage,
        context
      )
      setResult(response.data)
    } catch (err: any) {
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

  const getFormalityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'formal':
        return 'bg-purple-100 text-purple-800'
      case 'informal':
        return 'bg-blue-100 text-blue-800'
      case 'casual':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleWordClick = (word: string, context: string, type: 'vocabulary' | 'alternative' = 'vocabulary') => {
    learningPath.addItem({
      type,
      word,
      context,
      source: 'translate'
    })
    
    showLearningToast(word, type)
  }

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Translate Text</CardTitle>
          <CardDescription>
            Translate text with context-aware alternatives and detailed explanations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text to translate (from Spanish to English)
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the text you want to translate..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px] resize-vertical"
                disabled={isLoading}
              />
            </div>

            {/* Inline context hint */}
            {extractInlineContext(text).context && (
              <div className="text-sm mt-1">
                <span className="font-semibold">Context:</span>{' '}
                <span className="font-semibold">{extractInlineContext(text).context}</span>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                type="submit"
                disabled={isLoading || !extractInlineContext(text.trim()).text}
              >
                {isLoading ? 'Translating...' : 'Translate'}
              </Button>
              {result && (
                <Button type="button" variant="outline" onClick={handleReset}>
                  Clear
                </Button>
              )}
            </div>
          </form>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Primary Translation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Languages className="h-5 w-5" />
                <span>Primary Translation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <p 
                  className="p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 font-medium cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => handleWordClick(result.primary_translation, 'Primary translation', 'vocabulary')}
                  title="Click to add to learning path"
                >
                  {result.primary_translation}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Explanation */}
          {result.explanation && (
            <Card>
              <CardHeader>
                <CardTitle>Translation Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{result.explanation}</p>
              </CardContent>
            </Card>
          )}

          {/* Alternative Translations */}
          {result.alternatives.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Alternative Translations ({result.alternatives.length})</CardTitle>
                <CardDescription>
                  Different ways to express the same meaning with varying formality and context
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.alternatives.map((alt, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-md hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <p 
                          className="font-medium text-lg flex-1 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => handleWordClick(alt.translation, alt.context, 'alternative')}
                          title="Click to add to learning path"
                        >
                          {alt.translation}
                        </p>
                        <span className={`px-2 py-1 text-xs font-medium rounded ml-3 ${getFormalityColor(alt.formality_level)}`}>
                          {alt.formality_level}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">Context:</p>
                        <p>{alt.context}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
