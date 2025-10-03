'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Textarea, Tabs, TabsContent, TabsList, TabsTrigger, Badge } from '@/components/ui'
import { 
  Brain, 
  Languages, 
  BookOpen, 
  X, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Copy,
  ExternalLink,
  Lightbulb
} from 'lucide-react'
import { learningApi } from '@/lib/api'
import { formatApiError, extractInlineContext } from '@/lib/utils'

// Type definitions
interface GrammarError {
  error_type: string
  explanation: string
  incorrect: string
  correct: string
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
  alternative_expressions: AlternativeExpression[]
}

interface TranslateResponse {
  original_text: string
  primary_translation: string
  alternatives: Array<{
    translation: string
    context: string
    formality_level: string
  }>
}

interface DefineResponse {
  word: string
  definitions: Array<{
    definition: string
    example: string
    part_of_speech: string
  }>
  translation: string
}

export default function QuickAccessPage() {
  const [activeTab, setActiveTab] = useState('fix')
  const [shortcut, setShortcut] = useState('')
  
  // Fix states
  const [fixPhrase, setFixPhrase] = useState('')
  const [fixLoading, setFixLoading] = useState(false)
  const [fixResult, setFixResult] = useState<FixResponse | null>(null)
  
  // Translate states
  const [translateText, setTranslateText] = useState('')
  const [translateLoading, setTranslateLoading] = useState(false)
  const [translateResult, setTranslateResult] = useState<TranslateResponse | null>(null)

  // Fixed languages like in the regular view
  const sourceLanguage = 'Spanish'
  const targetLanguage = 'English'
  
  // Define states
  const [defineWord, setDefineWord] = useState('')
  const [defineLoading, setDefineLoading] = useState(false)
  const [defineResult, setDefineResult] = useState<DefineResponse | null>(null)
  
  const [error, setError] = useState('')

  useEffect(() => {
    // Get shortcut info for UI adjustments
    if (window.electronAPI) {
      window.electronAPI.getShortcut().then(setShortcut)
    }
  }, [])

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.hideQuickAccess()
    }
  }

  const handleOpenFull = () => {
    if (window.electronAPI) {
      window.electronAPI.showMainWindow()
      window.electronAPI.hideQuickAccess()
    }
  }

  const handleFixSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { text, context } = extractInlineContext(fixPhrase.trim())
    if (!text) return

    setFixLoading(true)
    setError('')
    setFixResult(null)

    try {
      const response = await learningApi.fixPhrase(text, context)
      setFixResult(response.data)
    } catch (err: unknown) {
      setError(formatApiError(err))
    } finally {
      setFixLoading(false)
    }
  }

  const handleTranslateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { text, context } = extractInlineContext(translateText.trim())
    if (!text) return

    setTranslateLoading(true)
    setError('')
    setTranslateResult(null)

    try {
      const response = await learningApi.translate(text, sourceLanguage, targetLanguage, context)
      setTranslateResult(response.data)
    } catch (err: unknown) {
      setError(formatApiError(err))
    } finally {
      setTranslateLoading(false)
    }
  }

  const handleDefineSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { text, context } = extractInlineContext(defineWord.trim())
    if (!text) return

    setDefineLoading(true)
    setError('')
    setDefineResult(null)

    try {
      const response = await learningApi.define(text, context)
      setDefineResult(response.data)
    } catch (err: unknown) {
      setError(formatApiError(err))
    } finally {
      setDefineLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const resetFix = () => {
    setFixPhrase('')
    setFixResult(null)
    setError('')
  }

  const resetTranslate = () => {
    setTranslateText('')
    setTranslateResult(null)
    setError('')
  }

  const resetDefine = () => {
    setDefineWord('')
    setDefineResult(null)
    setError('')
  }

  return (
    <div className="min-h-screen bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-4 w-4" />
          <h1 className="text-sm font-semibold">SpeakNative AI</h1>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenFull}
            className="h-6 w-6 p-0 text-white hover:bg-white/20"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 text-white hover:bg-white/20"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Shortcut hint */}
      <div className="px-3 py-2 bg-gray-50 text-xs text-gray-600 text-center border-b">
        Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">{shortcut}</kbd> anywhere to open
      </div>

      {/* Main content */}
      <div className="p-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fix" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              Fix
            </TabsTrigger>
            <TabsTrigger value="translate" className="text-xs">
              <Languages className="h-3 w-3 mr-1" />
              Translate
            </TabsTrigger>
            <TabsTrigger value="define" className="text-xs">
              <BookOpen className="h-3 w-3 mr-1" />
              Define
            </TabsTrigger>
          </TabsList>

          {/* Fix Tab */}
          <TabsContent value="fix" className="space-y-3 mt-3">
            <form onSubmit={handleFixSubmit} className="space-y-3">
              <Textarea
                placeholder="Enter your English phrase..."
                value={fixPhrase}
                onChange={(e) => setFixPhrase(e.target.value)}
                className="min-h-[60px] text-sm resize-none"
                disabled={fixLoading}
              />
              {extractInlineContext(fixPhrase).context && (
                <div className="text-xs mt-1">
                  <span className="font-semibold">Context:</span>{' '}
                  <span className="font-semibold">{extractInlineContext(fixPhrase).context}</span>
                </div>
              )}
              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={fixLoading || !extractInlineContext(fixPhrase.trim()).text}
                  className="flex-1"
                >
                  {fixLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Fixing...
                    </>
                  ) : (
                    'Fix My English'
                  )}
                </Button>
                {fixResult && (
                  <Button type="button" variant="outline" size="sm" onClick={resetFix}>
                    Clear
                  </Button>
                )}
              </div>
            </form>

            {fixResult && (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    {fixResult.is_correct ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm font-medium">
                      {fixResult.is_correct ? 'Perfect!' : 'Improved'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 bg-white rounded border text-sm">
                      {fixResult.corrected_phrase}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(fixResult.corrected_phrase)}
                        className="h-6 w-6 p-0 ml-2 float-right"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    {/* Native alternative (first alternative expression) */}
                    {fixResult.alternative_expressions && fixResult.alternative_expressions.length > 0 && (
                      <div className="p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="flex items-center text-xs font-medium text-blue-800 mb-1">
                          <Lightbulb className="h-3 w-3 mr-1" />
                          More native alternative
                        </div>
                        <div className="p-2 bg-white rounded border text-sm">
                          {fixResult.alternative_expressions[0].expression}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(fixResult.alternative_expressions[0].expression)}
                            className="h-6 w-6 p-0 ml-2 float-right"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                            {fixResult.alternative_expressions[0].formality_level}
                          </span>
                        </div>
                        <p className="text-xs text-blue-900 mt-1">
                          {fixResult.alternative_expressions[0].explanation}
                        </p>
                      </div>
                    )}
                    {fixResult.grammar_errors.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-600">Errors found:</p>
                        {fixResult.grammar_errors.map((error, index) => (
                          <div key={index} className="text-xs p-2 bg-red-50 rounded">
                            <Badge variant="secondary" className="text-xs mb-1">
                              {error.error_type}
                            </Badge>
                            <p className="text-gray-700 mb-1">{error.explanation}</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-[10px] font-medium text-red-700">Incorrect</p>
                                <p className="p-1 bg-white/70 border border-red-200 rounded text-[11px]">{error.incorrect}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-medium text-green-700">Correct</p>
                                <p className="p-1 bg-white/70 border border-green-200 rounded text-[11px]">{error.correct}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Translate Tab */}
          <TabsContent value="translate" className="space-y-3 mt-3">
            <form onSubmit={handleTranslateSubmit} className="space-y-3">
              <Textarea
                placeholder="Enter Spanish text to translate to English..."
                value={translateText}
                onChange={(e) => setTranslateText(e.target.value)}
                className="min-h-[60px] text-sm resize-none"
                disabled={translateLoading}
              />
              {extractInlineContext(translateText).context && (
                <div className="text-xs mt-1">
                  <span className="font-semibold">Context:</span>{' '}
                  <span className="font-semibold">{extractInlineContext(translateText).context}</span>
                </div>
              )}
              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={translateLoading || !extractInlineContext(translateText.trim()).text}
                  className="flex-1"
                >
                  {translateLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    'Translate'
                  )}
                </Button>
                {translateResult && (
                  <Button type="button" variant="outline" size="sm" onClick={resetTranslate}>
                    Clear
                  </Button>
                )}
              </div>
            </form>

            {translateResult && (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-600 mb-2">Translation:</p>
                  <div className="p-2 bg-white rounded border text-sm">
                    {translateResult.primary_translation}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(translateResult.primary_translation)}
                      className="h-6 w-6 p-0 ml-2 float-right"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  {translateResult.alternatives && translateResult.alternatives.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-medium text-gray-600">Alternatives:</p>
                      {translateResult.alternatives.slice(0, 2).map((alt, index) => (
                        <div key={index} className="text-xs p-2 bg-blue-50 rounded">
                          <div className="flex items-center justify-between">
                            <span>{alt.translation}</span>
                            <Badge variant="outline" className="text-xs">
                              {alt.formality_level}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Define Tab */}
          <TabsContent value="define" className="space-y-3 mt-3">
            <form onSubmit={handleDefineSubmit} className="space-y-3">
              <Input
                placeholder="Enter a word to define..."
                value={defineWord}
                onChange={(e) => setDefineWord(e.target.value)}
                className="text-sm"
                disabled={defineLoading}
              />
              {extractInlineContext(defineWord).context && (
                <div className="text-xs mt-1">
                  <span className="font-semibold">Context:</span>{' '}
                  <span className="font-semibold">{extractInlineContext(defineWord).context}</span>
                </div>
              )}
              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={defineLoading || !extractInlineContext(defineWord.trim()).text}
                  className="flex-1"
                >
                  {defineLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Looking up...
                    </>
                  ) : (
                    'Define Word'
                  )}
                </Button>
                {defineResult && (
                  <Button type="button" variant="outline" size="sm" onClick={resetDefine}>
                    Clear
                  </Button>
                )}
              </div>
            </form>

            {defineResult && (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">{defineResult.word}</h4>

                  {/* Spanish Translation */}
                  {defineResult.translation && (
                    <div className="p-2 bg-blue-50 rounded border border-blue-200 mb-2">
                      <div className="flex items-center text-xs font-medium text-blue-800 mb-1">
                        <Languages className="h-3 w-3 mr-1" />
                        Spanish Translation
                      </div>
                      <p className="text-sm font-medium text-blue-900">{defineResult.translation}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {defineResult.definitions.slice(0, 3).map((def, index) => (
                      <div key={index} className="p-2 bg-white rounded border">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs">
                            {def.part_of_speech}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{def.definition}</p>
                        <p className="text-xs text-gray-500 italic">{def.example}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Error display */}
        {error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  )
} 