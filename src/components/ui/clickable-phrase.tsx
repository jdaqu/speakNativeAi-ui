'use client'

import { ClickableWord } from './clickable-word'

interface ClickablePhraseProps {
  text: string
  className?: string
}

export function ClickablePhrase({ text, className = '' }: ClickablePhraseProps) {
  // Split text into words, spaces, and punctuation
  const tokens = text.match(/[\w']+|\s+|[^\w\s]/g) || []

  return (
    <span className={className}>
      {tokens.map((token, index) => {
        // Check if token is a word (contains letters)
        const isWord = /[a-zA-Z]/.test(token)

        if (isWord) {
          return <ClickableWord key={index} word={token} />
        } else {
          // Punctuation or space
          return <span key={index}>{token}</span>
        }
      })}
    </span>
  )
}
