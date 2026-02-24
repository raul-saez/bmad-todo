import { useState, useCallback } from 'react'

interface UseTodoFormReturn {
  title: string
  error: string | null
  setTitle: (value: string) => void
  setError: (error: string | null) => void
  reset: () => void
  validate: () => boolean
}

export function useTodoForm(): UseTodoFormReturn {
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  const validate = useCallback(() => {
    if (!title.trim()) {
      setError('Title is required')
      return false
    }

    if (title.length > 500) {
      setError('Title must be less than 500 characters')
      return false
    }

    setError(null)
    return true
  }, [title])

  const reset = useCallback(() => {
    setTitle('')
    setError(null)
  }, [])

  return {
    title,
    error,
    setTitle,
    setError,
    reset,
    validate,
  }
}
