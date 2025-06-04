'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, BookOpen, Volume2, Hash, Quote } from 'lucide-react'
import { learningApi } from '@/lib/api'

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

export default function DefinePage() {
  const router = useRouter()
  const [word, setWord] = useState('')
  const [context, setContext] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<DefineResponse | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!word.trim()) return

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await learningApi.define(word.trim(), context.trim() || undefined)
      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred while looking up the word')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setWord('')
    setContext('')
    setResult(null)
    setError('')
  }

  const getPartOfSpeechColor = (pos: string) => {
    switch (pos.toLowerCase()) {
      case 'noun':
        return 'bg-blue-100 text-blue-800'
      case 'verb':
        return 'bg-green-100 text-green-800'
      case 'adjective':
        return 'bg-purple-100 text-purple-800'
      case 'adverb':
        return 'bg-orange-100 text-orange-800'
      case 'preposition':
        return 'bg-pink-100 text-pink-800'
      case 'conjunction':
        return 'bg-indigo-100 text-indigo-800'
      case 'interjection':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const playPronunciation = () => {
    if (result?.pronunciation) {
      // This would integrate with a text-to-speech API
      // For now, we'll just show an alert
      alert(`Pronunciation: ${result.pronunciation}`)
    }
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
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Word Definitions</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Look Up a Word</CardTitle>
            <CardDescription>
              Get detailed definitions, pronunciation, examples, and synonyms for any English word
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Context (optional)
                </label>
                <Input
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Provide a sentence or context where you encountered this word..."
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Adding context helps provide more accurate definitions and examples
                </p>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={isLoading || !word.trim()}>
                  {isLoading ? 'Looking up...' : 'Define Word'}
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
            {/* Word Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-3xl font-bold text-gray-900">{result.word}</h2>
                    {result.pronunciation && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={playPronunciation}
                        className="flex items-center space-x-1"
                      >
                        <Volume2 className="h-4 w-4" />
                        <span className="text-sm">{result.pronunciation}</span>
                      </Button>
                    )}
                  </div>
                  {result.translation && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Translation:</p>
                      <p className="font-medium text-lg">{result.translation}</p>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Definitions */}
            {result.definitions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Hash className="h-5 w-5" />
                    <span>Definitions ({result.definitions.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {result.definitions.map((def, index) => (
                      <div key={index} className="border-l-4 border-primary pl-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getPartOfSpeechColor(def.part_of_speech)}`}>
                            {def.part_of_speech}
                          </span>
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
                </CardContent>
              </Card>
            )}

            {/* Synonyms */}
            {result.synonyms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Synonyms ({result.synonyms.length})</CardTitle>
                  <CardDescription>
                    Words with similar meanings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.synonyms.map((synonym, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium hover:bg-blue-100 cursor-pointer transition-colors"
                        onClick={() => {
                          setWord(synonym)
                          setResult(null)
                        }}
                      >
                        {synonym}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Click on any synonym to look it up
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Additional Notes */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-blue-800 font-medium mb-1">
                      Word added to your vocabulary!
                    </p>
                    <p className="text-blue-700 text-sm">
                      This word has been saved to your personal vocabulary list for future review and practice.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
} 