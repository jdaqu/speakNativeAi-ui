'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, CheckCircle, XCircle, Brain, BookOpen, Target } from 'lucide-react'
import { learningApi } from '@/lib/api'

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

interface FixResponse {
  original_phrase: string
  corrected_phrase: string
  is_correct: boolean
  grammar_errors: GrammarError[]
  vocabulary_suggestions: VocabularySuggestion[]
  practice_topics: PracticeTopic[]
}

export default function FixPage() {
  const router = useRouter()
  const [phrase, setPhrase] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<FixResponse | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phrase.trim()) return

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await learningApi.fixPhrase(phrase.trim())
      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred while processing your phrase')
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Fix My English</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter Your Phrase</CardTitle>
            <CardDescription>
              Type any English sentence or phrase and get instant grammar corrections and improvements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Textarea
                  value={phrase}
                  onChange={(e) => setPhrase(e.target.value)}
                  placeholder="e.g., I goes to store yesterday and buy some foods"
                  className="min-h-[100px] resize-vertical"
                  disabled={isLoading}
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={isLoading || !phrase.trim()}>
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
                      <div key={index} className="p-4 border border-gray-200 rounded-md">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            {error.error_type}
                          </span>
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
                      <div key={index} className="p-4 border border-gray-200 rounded-md">
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
      </main>
    </div>
  )
} 