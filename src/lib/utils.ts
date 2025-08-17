import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility to format API errors for display
export function formatApiError(error: any): string {
  if (!error) return 'An unknown error occurred'
  
  // If it's a simple string, return it
  if (typeof error === 'string') return error
  
  // If it's an axios error with response data
  if (error.response?.data) {
    const errorData = error.response.data
    
    // If detail is a string, return it
    if (typeof errorData.detail === 'string') {
      return errorData.detail
    }
    
    // If detail is an array of validation errors
    if (Array.isArray(errorData.detail)) {
      return errorData.detail
        .map((err: any) => {
          if (typeof err === 'string') return err
          if (err.msg) {
            const field = err.loc ? err.loc.join(' → ') : 'Unknown field'
            return `${field}: ${err.msg}`
          }
          return 'Validation error'
        })
        .join(', ')
    }
    
    // If there's a message field
    if (errorData.message) return errorData.message
    
    // If there's any other error structure
    return JSON.stringify(errorData)
  }
  
  // If it's a direct error message
  if (error.message) return error.message
  
  // Fallback
  return 'An unexpected error occurred'
} 

// Extract inline context marked as {context} from a free-form input string.
// Supports multiple {..} blocks; removes them from the returned text and joins contexts with "; ".
export function extractInlineContext(input: string): { text: string; context?: string } {
  if (!input) return { text: '' }
  const matches = Array.from(input.matchAll(/\{([^}]+)\}/g))
  const contexts = matches.map((m) => m[1].trim()).filter(Boolean)
  const text = input.replace(/\{[^}]+\}/g, '').replace(/\s+/g, ' ').trim()
  if (contexts.length === 0) return { text }
  return { text, context: contexts.join('; ') }
}