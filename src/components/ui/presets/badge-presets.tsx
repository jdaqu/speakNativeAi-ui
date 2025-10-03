import * as React from "react"
import { Badge, type BadgeProps } from "../primitives/badge"

// Part of Speech Badge
export interface PartOfSpeechBadgeProps extends Omit<BadgeProps, 'variant'> {
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'pronoun' | 'conjunction' | 'interjection'
}

export const PartOfSpeechBadge = React.forwardRef<HTMLDivElement, PartOfSpeechBadgeProps>(
  ({ partOfSpeech, children, ...props }, ref) => {
    return (
      <Badge
        {...props}
        ref={ref}
        variant={partOfSpeech}
        data-preset="part-of-speech-badge"
        {...props}
      >
        {children || partOfSpeech}
      </Badge>
    )
  }
)
PartOfSpeechBadge.displayName = "PartOfSpeechBadge"

// Formality Level Badge
export interface FormalityBadgeProps extends Omit<BadgeProps, 'variant'> {
  level: 'formal' | 'informal' | 'neutral'
}

export const FormalityBadge = React.forwardRef<HTMLDivElement, FormalityBadgeProps>(
  ({ level, children, ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        variant={level}
        data-preset="formality-badge"
        {...props}
      >
        {children || level}
      </Badge>
    )
  }
)
FormalityBadge.displayName = "FormalityBadge"

// Difficulty Level Badge
export interface DifficultyBadgeProps extends Omit<BadgeProps, 'variant'> {
  level: 'easy' | 'medium' | 'hard'
}

export const DifficultyBadge = React.forwardRef<HTMLDivElement, DifficultyBadgeProps>(
  ({ level, children, ...props }, ref) => {
    const displayLevel = level === 'medium' ? 'Medium' : level === 'easy' ? 'Easy' : 'Hard'

    return (
      <Badge
        ref={ref}
        variant={level}
        data-preset="difficulty-badge"
        {...props}
      >
        {children || displayLevel}
      </Badge>
    )
  }
)
DifficultyBadge.displayName = "DifficultyBadge"

// Grammar Error Type Badge
export interface GrammarErrorBadgeProps extends Omit<BadgeProps, 'variant'> {
  errorType: string
}

export const GrammarErrorBadge = React.forwardRef<HTMLDivElement, GrammarErrorBadgeProps>(
  ({ errorType, children, ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        variant="grammar-error"
        data-preset="grammar-error-badge"
        {...props}
      >
        {children || errorType}
      </Badge>
    )
  }
)
GrammarErrorBadge.displayName = "GrammarErrorBadge"

// Status Badge
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'success' | 'warning' | 'info' | 'destructive'
}

export const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, children, ...props }, ref) => {
    return (
      <Badge
        ref={ref}
        variant={status === 'destructive' ? 'destructive' : status}
        data-preset="status-badge"
        {...props}
      >
        {children}
      </Badge>
    )
  }
)
StatusBadge.displayName = "StatusBadge"