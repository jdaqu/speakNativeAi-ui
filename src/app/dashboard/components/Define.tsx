'use client'

import { useState, useMemo } from 'react'
import { FormCard, SectionCard, PartOfSpeechBadge, Input } from '@/components/ui'
import { Hash, Quote } from 'lucide-react'
import { InlineContextHint } from './shared/InlineContextHint'
import { learningApi } from '@/lib/api'
import { formatApiError, extractInlineContext } from '@/lib/utils'

interface Definition {
  part_of_speech: string
  definition: string
  example: string
}

interface DefineResponse {
  word: string
  definitions: Definition[]
  pronunciation: string
  synonyms: string[]
  translation: string
}

export default function Define() {
  const [word, setWord] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<DefineResponse | null>(null)
  const [error, setError] = useState('')

  // Cache inline context extraction to avoid recalculation
  const { text: extractedText, context: extractedContext } = useMemo(
    () => extractInlineContext(word.trim()),
    [word]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!extractedText) return

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await learningApi.define(extractedText, extractedContext)
      setResult(response.data)
    } catch (err: unknown) {
      setError(formatApiError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setWord('')
    setResult(null)
    setError('')
  }



  const handleSynonymClick = (synonym: string) => {
    setWord(synonym)
    setResult(null)
  }

  const getPartOfSpeechVariant = (pos: string): 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'pronoun' | 'conjunction' | 'interjection' => {
    const normalized = pos.toLowerCase()
    if (['noun', 'verb', 'adjective', 'adverb', 'preposition', 'pronoun', 'conjunction', 'interjection'].includes(normalized)) {
      return normalized as any
    }
    return 'noun' // default fallback
  }

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <FormCard
        title="Look Up a Word"
        description="Get detailed definitions, examples, and synonyms for any English word"
        primaryButton={{
          label: 'Define Word',
          loadingLabel: 'Looking up...',
          isLoading,
          isDisabled: !extractedText,
          form: 'define-word-form',
          type: 'submit'
        }}
        secondaryButton={{
          label: 'Clear',
          onClick: handleReset,
          showWhen: !!result
        }}
        error={error}
      >
        <form id="define-word-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Word to define
            </label>
            <Input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="e.g., serendipity, enigmatic, procrastinate"
              disabled={isLoading}
            />
          </div>

          {/* Inline context hint */}
          <InlineContextHint context={extractedContext} />
        </form>
      </FormCard>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Word Header */}
          <SectionCard
            title={result.word}
            titleSize="lg"
          >
            {result.translation && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Translation:</p>
                <p className="font-medium text-lg">{result.translation}</p>
              </div>
            )}
          </SectionCard>

          {/* Definitions */}
          {result.definitions.length > 0 && (
            <SectionCard
              title={`Definitions (${result.definitions.length})`}
              icon={<Hash className="h-5 w-5" />}
            >
              <div className="space-y-6">
                {result.definitions.map((def, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-primary pl-4 p-3 rounded-r-md"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <PartOfSpeechBadge partOfSpeech={getPartOfSpeechVariant(def.part_of_speech)} />
                      <span className="text-sm text-gray-500">#{index + 1}</span>
                    </div>

                    <p className="text-gray-900 font-medium mb-3 text-lg">
                      {def.definition}
                    </p>

                    {def.example && (
                      <div className="bg-gray-50 p-3 rounded-md border-l-2 border-gray-300">
                        <div className="flex items-start space-x-2">
                          <Quote className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-700 italic">
                            {def.example}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Synonyms */}
          {result.synonyms.length > 0 && (
            <SectionCard
              title={`Synonyms (${result.synonyms.length})`}
              description="Words with similar meanings"
            >
              <div className="flex flex-wrap gap-2">
                {result.synonyms.map((synonym, index) => (
                  <button
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium hover:bg-blue-100 cursor-pointer transition-colors"
                    onClick={() => handleSynonymClick(synonym)}
                    title="Click to look up"
                  >
                    {synonym}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Click on any synonym to look it up
              </p>
            </SectionCard>
          )}

        </div>
      )}
    </div>
  )
}
