'use client'

import { useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './primitives/tooltip'
import { Button } from './primitives/button'
import { learningApi } from '@/lib/api'
import { Bookmark, Loader2 } from 'lucide-react'

interface WordTranslation {
  word: string
  translation: string
  meaning: string
  debug_info?: Record<string, unknown>
}

interface ClickableWordProps {
  word: string
  className?: string
}

export function ClickableWord({ word, className = '' }: ClickableWordProps) {
  const [translation, setTranslation] = useState<WordTranslation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleClick = async () => {
    if (translation || isLoading) {
      setIsOpen(true)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await learningApi.translateWord(word)
      setTranslation(response.data)
      setIsOpen(true)
    } catch (err) {
      setError('Failed to load translation')
      console.error('Translation error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveWord = () => {
    // TODO: Implement save word functionality
    console.log('Save word:', word)
  }

  const handleOpenChange = (open: boolean) => {
    // Only allow opening if we have content to show
    if (open && !translation && !isLoading && !error) {
      return
    }
    setIsOpen(open)
  }

  return (
    <TooltipProvider delayDuration={0} skipDelayDuration={0}>
      <Tooltip open={isOpen} onOpenChange={handleOpenChange}>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className={`cursor-pointer text-inherit hover:opacity-70 transition-opacity ${isOpen ? 'bg-yellow-200 px-1 rounded' : ''} ${className}`}
            disabled={isLoading}
          >
            {word}
          </button>
        </TooltipTrigger>
        {(isLoading || error || translation) && (
          <TooltipContent className="max-w-xs p-3" side="top">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : translation ? (
              <div className="space-y-2">
                <div>
                  <p className="font-semibold text-sm">{translation.word}</p>
                  <p className="text-xs text-muted-foreground">{translation.translation}</p>
                </div>
                <p className="text-sm">{translation.meaning}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveWord}
                  className="w-full mt-2"
                >
                  <Bookmark className="h-3 w-3 mr-1" />
                  Save Word
                </Button>
              </div>
            ) : null}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}
