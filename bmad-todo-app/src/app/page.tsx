'use client'

import { useState } from 'react'
import { useTodos } from '@/hooks/useTodos'
import { TodoForm } from '@/components/TodoForm'
import { TodoList } from '@/components/TodoList'

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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Todo App</h1>
          <p className="text-gray-600">Stay organized and track your tasks</p>
        </div>

        <div className="space-y-6">
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
  )
}
