'use client'

import React from 'react'

interface TodoItemProps {
  id: string
  title: string
  completed: boolean
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export const TodoItem = React.forwardRef<HTMLLIElement, TodoItemProps>(
  ({ id, title, completed, onToggle, onDelete }, ref) => {
    return (
      <li
        ref={ref}
        className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        data-testid={`todo-item-${id}`}
      >
        <input
          type="checkbox"
          checked={completed}
          onChange={() => onToggle(id)}
          className="w-5 h-5 cursor-pointer"
          aria-label={`Mark "${title}" as ${completed ? 'incomplete' : 'complete'}`}
        />
        <span
          className={`flex-1 text-base ${
            completed ? 'line-through text-gray-400' : 'text-gray-900'
          }`}
        >
          {title}
        </span>
        <button
          onClick={() => onDelete(id)}
          className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
          aria-label={`Delete "${title}"`}
        >
          Delete
        </button>
      </li>
    )
  },
)

TodoItem.displayName = 'TodoItem'
