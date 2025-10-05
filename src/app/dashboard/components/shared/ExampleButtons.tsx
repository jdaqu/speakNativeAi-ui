'use client'

import { Button } from '@/components/ui'
import { Lightbulb } from 'lucide-react'

interface Example {
  text: string
  description: string
}

interface ExampleButtonsProps {
  examples: Example[]
  onExampleClick: (text: string) => void
  disabled?: boolean
}

export default function ExampleButtons({ examples, onExampleClick, disabled = false }: ExampleButtonsProps) {
  // Color variants using project's blue theme
  const colorVariants = [
    'bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 hover:text-blue-800 border-blue-200 hover:border-blue-300',
    'bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 text-indigo-700 hover:text-indigo-800 border-indigo-200 hover:border-indigo-300',
    'bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 text-primary hover:text-primary border-primary/30 hover:border-primary/50'
  ]

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center space-x-2 text-xs text-gray-600">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <span className="font-medium">Try these examples:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => onExampleClick(example.text)}
            disabled={disabled}
            className={`px-3 py-1.5 text-xs rounded-full border transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-sm hover:shadow-md ${colorVariants[index % colorVariants.length]}`}
            title={example.description}
          >
            <span className="font-medium">"{example.text}"</span>
          </button>
        ))}
      </div>
    </div>
  )
}
