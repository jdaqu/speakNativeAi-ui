'use client'

import { useState, useMemo } from 'react'
import { FormCard, SectionCard, ResultCard, GrammarErrorBadge, DifficultyBadge, FormalityBadge, Textarea } from '@/components/ui'
import { BookOpen, Target, Lightbulb, MessageSquare } from 'lucide-react'
import { InlineContextHint } from './shared/InlineContextHint'
import { learningApi } from '@/lib/api'
import { formatApiError, extractInlineContext } from '@/lib/utils'

interface GrammarError {
  error_type: string
  explanation: string
  incorrect: string
  correct: string
}

interface VocabularySuggestion {
  word: string
  definition: string
  example: string
  alternative: string
}

interface PracticeTopic {
  topic: string
  description: string
  difficulty: string
}

interface AlternativeExpression {
  expression: string
  formality_level: string
  context_usage: string
  explanation: string
}

interface FixResponse {
  original_phrase: string
  corrected_phrase: string
  is_correct: boolean
  grammar_errors: GrammarError[]
  vocabulary_suggestions: VocabularySuggestion[]
  practice_topics: PracticeTopic[]
  alternative_expressions: AlternativeExpression[]
  context_analysis?: string
}

export default function Fix() {
  const [phrase, setPhrase] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<FixResponse | null>(null)
  const [error, setError] = useState('')

  // Cache inline context extraction to avoid recalculation
  const { text: extractedText, context: extractedContext } = useMemo(
    () => extractInlineContext(phrase.trim()),
    [phrase]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!extractedText) return

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await learningApi.fixPhrase(extractedText, extractedContext)
      setResult(response.data)
    } catch (err: unknown) {
      setError(formatApiError(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setPhrase('')
    setResult(null)
    setError('')
  }


  return (
    <div className="space-y-8">
      {/* Input Section */}
      <FormCard
        title="Enter Your Phrase"
        description="Type any English sentence or phrase and get instant grammar corrections and improvements"
        primaryButton={{
          label: 'Fix My English',
          loadingLabel: 'Fixing...',
          isLoading,
          isDisabled: !extractedText,
          form: 'fix-phrase-form',
          type: 'submit'
        }}
        secondaryButton={{
          label: 'Try Another',
          onClick: handleReset,
          showWhen: !!result
        }}
        error={error}
      >
        <form id="fix-phrase-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phrase" className="block text-sm font-medium text-gray-700 mb-1">
              Your English phrase
            </label>
            <Textarea
              id="phrase"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="e.g., I goes to store yesterday and buy some foods"
              className="min-h-[100px] resize-vertical"
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
          {/* Correction Result */}
          <ResultCard
            title={result.is_correct ? 'Great! Your phrase is correct' : 'Here&apos;s the improved version'}
            original={result.original_phrase}
            corrected={result.corrected_phrase}
            isCorrect={result.is_correct}
          />

          {/* Grammar Errors */}
          {result.grammar_errors.length > 0 && (
            <SectionCard
              title={`Grammar Issues (${result.grammar_errors.length})`}
              icon={<Target className="h-5 w-5" />}
            >
              <div className="space-y-4">
                {result.grammar_errors.map((error, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-md"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <GrammarErrorBadge errorType={error.error_type} />
                    </div>
                    <p className="text-gray-700 mb-2">{error.explanation}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="font-medium text-red-600">Incorrect:</p>
                        <p className="p-2 bg-red-50 rounded">{error.incorrect}</p>
                      </div>
                      <div>
                        <p className="font-medium text-green-600">Correct:</p>
                        <p className="p-2 bg-green-50 rounded">{error.correct}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Context Analysis */}
          {result.context_analysis && (
            <SectionCard
              title="Context Analysis"
              icon={<MessageSquare className="h-5 w-5" />}
            >
              <p className="text-gray-700">{result.context_analysis}</p>
            </SectionCard>
          )}

          {/* Alternative Expressions */}
          {result.alternative_expressions.length > 0 && (
            <SectionCard
              title={`Alternative Ways to Express This (${result.alternative_expressions.length})`}
              icon={<Lightbulb className="h-5 w-5" />}
              description={
                result.is_correct
                  ? "Your phrase is correct! Here are some alternative ways to express the same idea:"
                  : "Here are some alternative ways to express your idea:"
              }
            >
              <div className="space-y-4">
                {result.alternative_expressions.map((alternative, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-md bg-blue-50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-lg text-blue-900">
                        &ldquo;{alternative.expression}&rdquo;
                      </h4>
                      <FormalityBadge level={alternative.formality_level as 'formal' | 'informal' | 'neutral'} />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">When to use:</p>
                        <p className="text-gray-600">{alternative.context_usage}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Why this works:</p>
                        <p className="text-gray-600">{alternative.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Vocabulary Suggestions */}
          {result.vocabulary_suggestions.length > 0 && (
            <SectionCard
              title={`Vocabulary Suggestions (${result.vocabulary_suggestions.length})`}
              icon={<BookOpen className="h-5 w-5" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.vocabulary_suggestions.map((vocab, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-md"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-lg">{vocab.word}</h4>
                      <span className="text-sm text-gray-500">Alternative: {vocab.alternative}</span>
                    </div>
                    <p className="text-gray-700 mb-2">{vocab.definition}</p>
                    <div className="text-sm">
                      <p className="font-medium text-gray-600">Example:</p>
                      <p className="italic text-gray-600">{vocab.example}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Practice Topics */}
          {result.practice_topics.length > 0 && (
            <SectionCard
              title={`Recommended Practice (${result.practice_topics.length})`}
              icon={<Target className="h-5 w-5" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.practice_topics.map((topic, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{topic.topic}</h4>
                      <DifficultyBadge level={topic.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'} />
                    </div>
                    <p className="text-gray-600 text-sm">{topic.description}</p>
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
