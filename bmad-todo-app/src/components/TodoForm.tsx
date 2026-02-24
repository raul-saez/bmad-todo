'use client'

import React, { FormEvent, useRef } from 'react'
import { useTodoForm } from '@/hooks/useTodoForm'
import { LoadingSpinner } from './ui/LoadingSpinner'

interface TodoFormProps {
  onSubmit: (title: string) => Promise<void>
  isSubmitting?: boolean
}

export const TodoForm: React.FC<TodoFormProps> = ({
  onSubmit,
  isSubmitting = false,
}) => {
  const { title, error, setTitle, reset, validate } = useTodoForm()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    await onSubmit(title)
    reset()
    inputRef.current?.focus()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      reset()
      inputRef.current?.focus()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="form"
      aria-label="Add new todo"
      className="flex flex-col gap-2 p-3 sm:p-4 bg-white rounded-lg border shadow-sm"
    >
      <label
        htmlFor="todo-input"
        className="text-xs sm:text-sm font-medium text-gray-700"
      >
        Add a new todo
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id="todo-input"
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a new todo..."
          maxLength={500}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'error-message' : undefined}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner
                size="sm"
                className="border-white border-t-white/30"
              />
              <span>Adding...</span>
            </>
          ) : (
            'Add'
          )}
        </button>
      </div>
      {error && (
        <p
          id="error-message"
          role="alert"
          aria-live="assertive"
          className="text-sm text-red-600"
        >
          {error}
        </p>
      )}
    </form>
  )
}
