'use client'

import React from 'react'
import { Todo } from '@/lib/schemas'
import { TodoItem } from './TodoItem'
import { TodoSkeleton } from './ui/Skeleton'
import { ErrorMessage } from './ui/ErrorMessage'

interface TodoListProps {
  todos: Todo[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  isLoading?: boolean
  error?: string | null
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  onToggle,
  onDelete,
  isLoading,
  error,
}) => {
  if (error) {
    return <ErrorMessage title="Error loading todos" message={error} />
  }

  if (isLoading) {
    return (
      <div role="status" aria-live="polite" className="space-y-2 sm:space-y-3">
        <TodoSkeleton />
        <TodoSkeleton />
        <TodoSkeleton />
      </div>
    )
  }

  if (todos.length === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="p-3 sm:p-4 text-center text-gray-500"
      >
        <p className="text-sm sm:text-base">
          No todos yet. Add one to get started!
        </p>
      </div>
    )
  }

  const completedCount = todos.filter((t) => t.completed).length

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
        <p
          className="text-xs sm:text-sm text-gray-600"
          aria-live="polite"
          aria-atomic="true"
        >
          {completedCount} of {todos.length} completed
        </p>
        {completedCount > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 ml-2 sm:ml-3">
            <div
              className="bg-green-600 h-1.5 sm:h-2 rounded-full transition-all"
              style={{ width: `${(completedCount / todos.length) * 100}%` }}
              role="progressbar"
              aria-valuenow={completedCount}
              aria-valuemin={0}
              aria-valuemax={todos.length}
            />
          </div>
        )}
      </div>
      <ul className="space-y-2 sm:space-y-3" role="list">
        \n{' '}
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            id={todo.id}
            title={todo.title}
            completed={todo.completed}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  )
}
