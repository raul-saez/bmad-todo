import { renderHook, act, waitFor } from '@testing-library/react'
import { useTodos } from '@/hooks/useTodos'

// Mock fetch
global.fetch = jest.fn()

describe('useTodos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initializes with empty todos', async () => {
    const mockFetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })
    global.fetch = mockFetch

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.todos).toEqual([])
    })
  })

  it('fetches todos on mount', async () => {
    const todos = [
      {
        id: '1',
        title: 'Test',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    const mockFetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => todos,
    })
    global.fetch = mockFetch

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.todos).toEqual(todos)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/todos')
  })

  it('creates a new todo', async () => {
    const newTodo = {
      id: '2',
      title: 'New todo',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => newTodo,
      })
    global.fetch = mockFetch

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.todos).toEqual([])
    })

    let created = null
    await act(async () => {
      created = await result.current.createTodo('New todo')
    })

    expect(created).toEqual(newTodo)
    expect(result.current.todos).toEqual([newTodo])
  })

  it('updates a todo', async () => {
    const initialTodos = [
      {
        id: '1',
        title: 'Original',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    const updatedTodo = {
      id: '1',
      title: 'Updated',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => initialTodos,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTodo,
      })
    global.fetch = mockFetch

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.todos).toEqual(initialTodos)
    })

    await act(async () => {
      await result.current.updateTodo('1', { title: 'Updated' })
    })

    expect(result.current.todos[0]).toEqual(updatedTodo)
  })

  it('deletes a todo', async () => {
    const initialTodos = [
      {
        id: '1',
        title: 'To delete',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => initialTodos,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
    global.fetch = mockFetch

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.todos).toEqual(initialTodos)
    })

    await act(async () => {
      await result.current.deleteTodo('1')
    })

    expect(result.current.todos).toEqual([])
  })

  it('handles fetch errors', async () => {
    const mockFetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    })
    global.fetch = mockFetch

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
      expect(result.current.todos).toEqual([])
    })
  })
})
