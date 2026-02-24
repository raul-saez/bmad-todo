import { renderHook, act } from '@testing-library/react'
import { useTodoForm } from '@/hooks/useTodoForm'

describe('useTodoForm', () => {
  it('initializes with empty values', () => {
    const { result } = renderHook(() => useTodoForm())

    expect(result.current.title).toBe('')
    expect(result.current.error).toBe(null)
  })

  it('updates title', () => {
    const { result } = renderHook(() => useTodoForm())

    act(() => {
      result.current.setTitle('New todo')
    })

    expect(result.current.title).toBe('New todo')
  })

  it('validates required title', () => {
    const { result } = renderHook(() => useTodoForm())

    act(() => {
      result.current.setTitle('')
    })

    let isValid = false
    act(() => {
      isValid = result.current.validate()
    })

    expect(isValid).toBe(false)
    expect(result.current.error).toBe('Title is required')
  })

  it('validates title max length', () => {
    const { result } = renderHook(() => useTodoForm())

    act(() => {
      result.current.setTitle('a'.repeat(501))
    })

    let isValid = false
    act(() => {
      isValid = result.current.validate()
    })

    expect(isValid).toBe(false)
    expect(result.current.error).toBe('Title must be less than 500 characters')
  })

  it('validates successful with valid input', () => {
    const { result } = renderHook(() => useTodoForm())

    act(() => {
      result.current.setTitle('Valid todo')
    })

    let isValid = false
    act(() => {
      isValid = result.current.validate()
    })

    expect(isValid).toBe(true)
    expect(result.current.error).toBe(null)
  })

  it('resets form', () => {
    const { result } = renderHook(() => useTodoForm())

    act(() => {
      result.current.setTitle('Some title')
      result.current.setError('Some error')
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.title).toBe('')
    expect(result.current.error).toBe(null)
  })
})
