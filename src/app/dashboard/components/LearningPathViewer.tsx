'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Target, Brain, Shuffle, Trash2 } from 'lucide-react'
import { learningPath, LearningItem } from '@/lib/learning-path'

export default function LearningPathViewer() {
  const [items, setItems] = useState<LearningItem[]>([])

  const loadItems = () => {
    setItems(learningPath.getItems())
  }

  useEffect(() => {
    loadItems()
    // Refresh every second to show new items
    const interval = setInterval(loadItems, 1000)
    return () => clearInterval(interval)
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'vocabulary': return <BookOpen className="h-4 w-4" />
      case 'error': return <Target className="h-4 w-4" />
      case 'synonym': return <Shuffle className="h-4 w-4" />
      case 'alternative': return <Brain className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vocabulary': return 'bg-blue-100 text-blue-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'synonym': return 'bg-green-100 text-green-800'
      case 'alternative': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleClearAll = () => {
    learningPath.clearAll()
    loadItems()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Learning Path (Testing View)</CardTitle>
            <CardDescription>
              Items you've clicked will appear here. This is stored in localStorage.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            <Trash2 className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No items in learning path yet. Click on vocabulary words, errors, or alternatives above to add items!
          </p>
        ) : (
          <div className="space-y-3">
            {items.slice().reverse().map((item) => (
              <div key={item.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md">
                <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(item.type)}`}>
                  {getIcon(item.type)}
                  {item.type}
                </span>
                <div className="flex-1">
                  <h4 className="font-medium">{item.word}</h4>
                  {item.definition && (
                    <p className="text-sm text-gray-600 mt-1">{item.definition}</p>
                  )}
                  {item.example && (
                    <p className="text-sm text-gray-500 italic mt-1">"{item.example}"</p>
                  )}
                  <div className="flex items-center space-x-2 mt-2 text-xs text-gray-400">
                    <span>From: {item.source}</span>
                    <span>•</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}