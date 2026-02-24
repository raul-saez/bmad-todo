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
        className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 animate-fade-in"
        data-testid={`todo-item-${id}`}
      >
        <input
          type="checkbox"
          checked={completed}
          onChange={() => onToggle(id)}
          className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer flex-shrink-0 accent-blue-600"
          aria-label={`Mark "${title}" as ${completed ? 'incomplete' : 'complete'}`}
        />
        <span
          className={`flex-1 text-sm sm:text-base break-words transition-all duration-200 ${
            completed ? 'line-through text-gray-400' : 'text-gray-900'
          }`}
        >
          {title}
        </span>
        <button
          onClick={() => onDelete(id)}
          className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 hover:text-red-700 transition-all duration-200 flex-shrink-0"
          aria-label={`Delete "${title}"`}
        >
          Delete
        </button>
      </li>
    )
  },
)

TodoItem.displayName = 'TodoItem'
