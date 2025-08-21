'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, XCircle, Brain, BookOpen, Target, Lightbulb, MessageSquare } from 'lucide-react'
import { learningApi } from '@/lib/api'
import { formatApiError, extractInlineContext } from '@/lib/utils'
import { learningPath } from '@/lib/learning-path'
import { showLearningToast } from '@/components/ui/learning-toast'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { text, context } = extractInlineContext(phrase.trim())
    if (!text) return

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await learningApi.fixPhrase(text, context)
      setResult(response.data)
    } catch (err: any) {
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

  const handleErrorClick = (error: GrammarError) => {
    learningPath.addItem({
      type: 'error',
      word: error.incorrect,
      definition: error.correct,
      explanation: error.explanation,
      context: error.error_type,
      source: 'fix'
    })
    
    showLearningToast(error.incorrect, 'error')
  }

  const handleVocabClick = (vocab: VocabularySuggestion) => {
    learningPath.addItem({
      type: 'vocabulary',
      word: vocab.word,
      definition: vocab.definition,
      example: vocab.example,
      context: `Alternative: ${vocab.alternative}`,
      source: 'fix'
    })
    
    showLearningToast(vocab.word, 'vocabulary')
  }

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Your Phrase</CardTitle>
          <CardDescription>
            Type any English sentence or phrase and get instant grammar corrections and improvements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            {extractInlineContext(phrase).context && (
              <div className="text-sm mt-1">
                <span className="font-semibold">Context:</span>{' '}
                <span className="font-semibold">{extractInlineContext(phrase).context}</span>
              </div>
            )}
            <div className="flex space-x-2">
              <Button
                type="submit"
                disabled={
                  isLoading || !extractInlineContext(phrase.trim()).text
                }
              >
                {isLoading ? 'Analyzing...' : 'Fix My English'}
              </Button>
              {result && (
                <Button type="button" variant="outline" onClick={handleReset}>
                  Try Another
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
          {/* Correction Result */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                {result.is_correct ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <CardTitle>
                  {result.is_correct ? 'Great! Your phrase is correct' : 'Here\'s the improved version'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Original:</p>
                <p className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
                  {result.original_phrase}
                </p>
              </div>
              {!result.is_correct && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Corrected:</p>
                  <p className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
                    {result.corrected_phrase}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Grammar Errors */}
          {result.grammar_errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Grammar Issues ({result.grammar_errors.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.grammar_errors.map((error, index) => (
                    <div 
                      key={index} 
                      className="p-4 border border-gray-200 rounded-md hover:border-red-300 transition-colors cursor-pointer"
                      onClick={() => handleErrorClick(error)}
                      title="Click to add to learning path"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {error.error_type}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{error.explanation}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="font-medium text-red-600">Incorrect:</p>
                          <p className="p-2 bg-red-50 rounded hover:bg-red-100 transition-colors">{error.incorrect}</p>
                        </div>
                        <div>
                          <p className="font-medium text-green-600">Correct:</p>
                          <p className="p-2 bg-green-50 rounded hover:bg-green-100 transition-colors">{error.correct}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Context Analysis */}
          {result.context_analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Context Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{result.context_analysis}</p>
              </CardContent>
            </Card>
          )}

          {/* Alternative Expressions */}
          {result.alternative_expressions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5" />
                  <span>Alternative Ways to Express This ({result.alternative_expressions.length})</span>
                </CardTitle>
                <CardDescription>
                  {result.is_correct 
                    ? "Your phrase is correct! Here are some alternative ways to express the same idea:"
                    : "Here are some alternative ways to express your idea:"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.alternative_expressions.map((alternative, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-md bg-blue-50">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-lg text-blue-900">
                          "{alternative.expression}"
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          alternative.formality_level === 'formal' ? 'bg-purple-100 text-purple-800' :
                          alternative.formality_level === 'informal' ? 'bg-green-100 text-green-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {alternative.formality_level}
                        </span>
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
              </CardContent>
            </Card>
          )}

          {/* Vocabulary Suggestions */}
          {result.vocabulary_suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Vocabulary Suggestions ({result.vocabulary_suggestions.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.vocabulary_suggestions.map((vocab, index) => (
                    <div 
                      key={index} 
                      className="p-4 border border-gray-200 rounded-md hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => handleVocabClick(vocab)}
                      title="Click to add to learning path"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg hover:text-blue-600 transition-colors">{vocab.word}</h4>
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
              </CardContent>
            </Card>
          )}

          {/* Practice Topics */}
          {result.practice_topics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Recommended Practice ({result.practice_topics.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.practice_topics.map((topic, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{topic.topic}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          topic.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          topic.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {topic.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{topic.description}</p>
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
