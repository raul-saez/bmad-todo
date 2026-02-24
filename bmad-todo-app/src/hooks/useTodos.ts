import { useState, useCallback, useEffect } from 'react'
import { Todo } from '@/lib/schemas'
import * as storage from '@/services/storage/storage'

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

      try {
        await storage.initStorage()
        const cached = await storage.getAllTodos()
        if (cached.length > 0) {
          setTodos(cached)
        }
      } catch (storageError) {
        console.warn('Failed to load cached todos', storageError)
      }

      const response = await fetch('/api/todos')

      if (!response.ok) {
        throw new Error(`Failed to fetch todos: ${response.statusText}`)
      }

      const data = await response.json()
      setTodos(data)

      try {
        await storage.clearAll()
        await Promise.all(data.map((todo: Todo) => storage.saveTodo(todo)))
      } catch (storageError) {
        console.warn('Failed to persist fetched todos', storageError)
      }
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
      const tempId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const optimisticTodo: Todo = {
        id: tempId,
        title,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      try {
        setError(null)
        setTodos((prev) => [optimisticTodo, ...prev])

        try {
          await storage.saveTodo(optimisticTodo)
        } catch (storageError) {
          console.warn('Failed to persist optimistic todo', storageError)
        }

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
        setTodos((prev) =>
          prev.map((todo) => (todo.id === tempId ? newTodo : todo)),
        )

        try {
          await storage.deleteTodo(tempId)
          await storage.saveTodo(newTodo)
        } catch (storageError) {
          console.warn('Failed to persist created todo', storageError)
        }
        return newTodo
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        setTodos((prev) => prev.filter((todo) => todo.id !== tempId))

        try {
          await storage.deleteTodo(tempId)
        } catch (storageError) {
          console.warn('Failed to rollback optimistic todo', storageError)
        }
        return null
      }
    },
    [],
  )

  const updateTodo = useCallback(
    async (id: string, updates: Partial<Todo>): Promise<Todo | null> => {
      let previousTodo: Todo | null = null

      try {
        setError(null)

        setTodos((prev) => {
          previousTodo = prev.find((todo) => todo.id === id) ?? null
          return prev.map((todo) =>
            todo.id === id ? { ...todo, ...updates } : todo,
          )
        })

        try {
          await storage.updateTodo(id, updates)
        } catch (storageError) {
          console.warn('Failed to persist optimistic update', storageError)
        }

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

        try {
          await storage.saveTodo(updated)
        } catch (storageError) {
          console.warn('Failed to persist updated todo', storageError)
        }
        return updated
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)

        if (previousTodo) {
          setTodos((prev) =>
            prev.map((todo) => (todo.id === id ? previousTodo : todo)),
          )

          try {
            await storage.saveTodo(previousTodo)
          } catch (storageError) {
            console.warn('Failed to rollback todo update', storageError)
          }
        }
        return null
      }
    },
    [],
  )

  const deleteTodo = useCallback(async (id: string): Promise<boolean> => {
    let previousTodo: Todo | null = null

    try {
      setError(null)

      setTodos((prev) => {
        previousTodo = prev.find((todo) => todo.id === id) ?? null
        return prev.filter((todo) => todo.id !== id)
      })

      try {
        await storage.deleteTodo(id)
      } catch (storageError) {
        console.warn('Failed to persist optimistic delete', storageError)
      }

      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(
          data.error || `Failed to delete todo: ${response.statusText}`,
        )
      }

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)

      if (previousTodo) {
        setTodos((prev) => [previousTodo as Todo, ...prev])

        try {
          await storage.saveTodo(previousTodo)
        } catch (storageError) {
          console.warn('Failed to rollback todo delete', storageError)
        }
      }
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
