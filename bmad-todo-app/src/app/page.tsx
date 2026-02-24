'use client'

import { useState } from 'react'
import { useTodos } from '@/hooks/useTodos'
import { TodoForm } from '@/components/TodoForm'
import { TodoList } from '@/components/TodoList'
import { SyncProvider } from '@/components/providers/SyncProvider'
import { SyncStatus } from '@/components/features/todos/SyncStatus'

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { todos, loading, error, createTodo, updateTodo, deleteTodo } =
    useTodos()

  const handleAddTodo = async (title: string) => {
    setIsSubmitting(true)
    try {
      await createTodo(title)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id)
    if (todo) {
      await updateTodo(id, { completed: !todo.completed })
    }
  }

  const handleDeleteTodo = async (id: string) => {
    await deleteTodo(id)
  }

  return (
    <SyncProvider>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Todo App
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Stay organized and track your tasks
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <SyncStatus />
            <TodoForm onSubmit={handleAddTodo} isSubmitting={isSubmitting} />
            <TodoList
              todos={todos}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
              isLoading={loading}
              error={error}
            />
          </div>

          <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>Built with Next.js, TypeScript, and Tailwind CSS</p>
          </footer>
        </div>
      </main>
    </SyncProvider>
  )
}
