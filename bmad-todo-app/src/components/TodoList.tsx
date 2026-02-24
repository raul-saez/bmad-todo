'use client'

import React from 'react'
import { Todo } from '@/lib/schemas'
import { TodoItem } from './TodoItem'

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
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
      >
        <p className="font-medium">Error loading todos</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="p-4 text-center text-gray-500"
      >
        <p>Loading todos...</p>
      </div>
    )
  }

  if (todos.length === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="p-4 text-center text-gray-500"
      >
        <p>No todos yet. Add one to get started!</p>
      </div>
    )
  }

  const completedCount = todos.filter((t) => t.completed).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <p
          className="text-sm text-gray-600"
          aria-live="polite"
          aria-atomic="true"
        >
          {completedCount} of {todos.length} completed
        </p>
        {completedCount > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2 ml-3">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${(completedCount / todos.length) * 100}%` }}
              role="progressbar"
              aria-valuenow={completedCount}
              aria-valuemin={0}
              aria-valuemax={todos.length}
            />
          </div>
        )}
      </div>
      <ul className="space-y-2" role="list">
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
