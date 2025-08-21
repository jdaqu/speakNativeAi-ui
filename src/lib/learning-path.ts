interface LearningItem {
  id: string
  type: 'vocabulary' | 'error' | 'synonym' | 'alternative'
  word: string
  definition?: string
  example?: string
  context?: string
  explanation?: string
  timestamp: number
  source: 'fix' | 'translate' | 'define'
}

class LearningPath {
  private storageKey = 'speaknative-learning-path'

  getItems(): LearningItem[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  addItem(item: Omit<LearningItem, 'id' | 'timestamp'>): void {
    const items = this.getItems()
    const newItem: LearningItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    }
    
    // Avoid duplicates based on word and type
    const exists = items.some(existing => 
      existing.word === newItem.word && 
      existing.type === newItem.type &&
      existing.source === newItem.source
    )
    
    if (!exists) {
      items.push(newItem)
      localStorage.setItem(this.storageKey, JSON.stringify(items))
    }
  }

  removeItem(id: string): void {
    const items = this.getItems().filter(item => item.id !== id)
    localStorage.setItem(this.storageKey, JSON.stringify(items))
  }

  clearAll(): void {
    localStorage.removeItem(this.storageKey)
  }

  getItemsByType(type: LearningItem['type']): LearningItem[] {
    return this.getItems().filter(item => item.type === type)
  }

  getItemsBySource(source: LearningItem['source']): LearningItem[] {
    return this.getItems().filter(item => item.source === source)
  }
}

export const learningPath = new LearningPath()
export type { LearningItem }