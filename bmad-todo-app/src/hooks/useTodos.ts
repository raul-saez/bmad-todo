import { useState, useCallback, useEffect } from 'react'
import { Todo } from '@/lib/schemas'

interface UseTodosReturn {
  todos: Todo[]
  loading: boolean
  error: string | null
  fetchTodos: () => Promise<void>
  createTodo: (title: string) => Promise<Todo | null>
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<Todo | null>
  deleteTodo: (id: string) => Promise<boolean>
}

export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/todos')

      if (!response.ok) {
        throw new Error(`Failed to fetch todos: ${response.statusText}`)
      }

      const data = await response.json()
      setTodos(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setTodos([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createTodo = useCallback(
    async (title: string): Promise<Todo | null> => {
      try {
        setError(null)
        const response = await fetch('/api/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(
            data.error || `Failed to create todo: ${response.statusText}`,
          )
        }

        const newTodo = await response.json()
        setTodos((prev) => [newTodo, ...prev])
        return newTodo
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        return null
      }
    },
    [],
  )

  const updateTodo = useCallback(
    async (id: string, updates: Partial<Todo>): Promise<Todo | null> => {
      try {
        setError(null)
        const response = await fetch(`/api/todos/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(
            data.error || `Failed to update todo: ${response.statusText}`,
          )
        }

        const updated = await response.json()
        setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)))
        return updated
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        return null
      }
    },
    [],
  )

  const deleteTodo = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null)
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(
          data.error || `Failed to delete todo: ${response.statusText}`,
        )
      }

      setTodos((prev) => prev.filter((t) => t.id !== id))
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      return false
    }
  }, [])

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  return {
    todos,
    loading,
    error,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
  }
}
