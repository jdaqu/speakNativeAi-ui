'use client'

import { useState, useEffect } from 'react'
import { BookOpen, CheckCircle } from 'lucide-react'

interface ToastMessage {
  id: string
  word: string
  type: string
}

export function LearningToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const showMessage = (word: string, type: string) => {
    const id = crypto.randomUUID()
    const newMessage = { id, word, type }
    
    setMessages(prev => [...prev, newMessage])
    
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== id))
    }, 3000)
  }

  // Listen for custom events
  useEffect(() => {
    const handleLearningPathAdd = (event: CustomEvent) => {
      showMessage(event.detail.word, event.detail.type)
    }

    window.addEventListener('learningPathAdd', handleLearningPathAdd as EventListener)
    
    return () => {
      window.removeEventListener('learningPathAdd', handleLearningPathAdd as EventListener)
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-md shadow-lg flex items-center space-x-2 animate-in fade-in slide-in-from-right-1 duration-300"
        >
          <CheckCircle className="h-4 w-4 text-green-600" />
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span className="font-medium">"{message.word}"</span>
            <span className="text-sm">added to learning path</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// Helper function to trigger the toast
export const showLearningToast = (word: string, type: string) => {
  const event = new CustomEvent('learningPathAdd', {
    detail: { word, type }
  })
  window.dispatchEvent(event)
}