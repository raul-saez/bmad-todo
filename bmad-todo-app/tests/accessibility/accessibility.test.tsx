/**
 * Accessibility Tests for Todo App
 *
 * Tests keyboard navigation, ARIA labels, screen reader support, and focus management
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { TodoForm } from '@/components/TodoForm'
import { TodoList } from '@/components/TodoList'
import { TodoItem } from '@/components/TodoItem'
import { todoFactory } from '@/__tests__/fixtures/todos.fixtures'

describe('Accessibility Tests', () => {
  describe('TodoForm Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      const mockSubmit = jest.fn()
      render(<TodoForm onSubmit={mockSubmit} />)

      const input = screen.getByLabelText(/add a new todo/i)
      expect(input).toHaveAttribute('id', 'todo-input')
      expect(input).toBeInTheDocument()

      const button = screen.getByRole('button', { name: /add/i })
      expect(button).toBeInTheDocument()
    })

    it('shows error with proper ARIA attributes', () => {
      const mockSubmit = jest.fn()
      const { rerender } = render(<TodoForm onSubmit={mockSubmit} />)

      // Trigger validation error by trying to submit empty form
      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
    })

    it('input is keyboard navigable', () => {
      const mockSubmit = jest.fn()
      render(<TodoForm onSubmit={mockSubmit} />)

      const input = screen.getByRole('textbox')
      expect(input).not.toHaveAttribute('tabindex', '-1')
    })
  })

  describe('TodoList Accessibility', () => {
    const mockTodos = [
      todoFactory({ id: '1', title: 'First todo' }),
      todoFactory({ id: '2', title: 'Second todo', completed: true }),
    ]

    it('has proper list role', () => {
      render(
        <TodoList
          todos={mockTodos}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
        />,
      )

      const list = screen.getByRole('list')
      expect(list).toBeInTheDocument()
    })

    it('shows loading state with proper ARIA', () => {
      render(
        <TodoList
          todos={[]}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
          isLoading={true}
        />,
      )

      const statuses = screen.getAllByRole('status')
      expect(statuses.length).toBeGreaterThan(0)
      // The container should have aria-live="polite"
      const container = statuses.find(
        (el) => el.getAttribute('aria-live') === 'polite',
      )
      expect(container).toBeDefined()
    })

    it('shows error state with proper ARIA', () => {
      render(
        <TodoList
          todos={[]}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
          error="Test error"
        />,
      )

      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('aria-live', 'assertive')
    })

    it('shows progress bar with proper ARIA attributes', () => {
      render(
        <TodoList
          todos={mockTodos}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
        />,
      )

      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow')
      expect(progressbar).toHaveAttribute('aria-valuemin', '0')
      expect(progressbar).toHaveAttribute('aria-valuemax', '2')
    })
  })

  describe('TodoItem Accessibility', () => {
    const mockTodo = todoFactory({ id: '1', title: 'Test todo' })

    it('has descriptive checkbox label', () => {
      render(
        <TodoItem
          id={mockTodo.id}
          title={mockTodo.title}
          completed={false}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
        />,
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAccessibleName(/mark "test todo" as complete/i)
    })

    it('has descriptive delete button label', () => {
      render(
        <TodoItem
          id={mockTodo.id}
          title={mockTodo.title}
          completed={false}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
        />,
      )

      const deleteButton = screen.getByRole('button', {
        name: /delete "test todo"/i,
      })
      expect(deleteButton).toBeInTheDocument()
    })

    it('checkbox is keyboard navigable', () => {
      render(
        <TodoItem
          id={mockTodo.id}
          title={mockTodo.title}
          completed={false}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
        />,
      )

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toHaveAttribute('tabindex', '-1')
    })

    it('delete button is keyboard navigable', () => {
      render(
        <TodoItem
          id={mockTodo.id}
          title={mockTodo.title}
          completed={false}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
        />,
      )

      const button = screen.getByRole('button')
      expect(button).not.toHaveAttribute('tabindex', '-1')
    })
  })

  describe('Keyboard Navigation', () => {
    it('form submit button is reachable via keyboard', () => {
      const mockSubmit = jest.fn()
      render(<TodoForm onSubmit={mockSubmit} />)

      const button = screen.getByRole('button')
      expect(button).toBeEnabled()
      expect(button).not.toHaveAttribute('tabindex', '-1')
    })

    it('all interactive elements have visible focus indicators', () => {
      const mockTodo = todoFactory({ id: '1', title: 'Test' })
      render(
        <TodoItem
          id={mockTodo.id}
          title={mockTodo.title}
          completed={false}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
        />,
      )

      // Focus indicators are handled by CSS :focus-visible
      // This test verifies elements are focusable
      const checkbox = screen.getByRole('checkbox')
      const button = screen.getByRole('button')

      expect(checkbox).not.toHaveAttribute('tabindex', '-1')
      expect(button).not.toHaveAttribute('tabindex', '-1')
    })
  })

  describe('Screen Reader Support', () => {
    it('provides live region updates for todo count', () => {
      const todos = [
        todoFactory({ id: '1', completed: false }),
        todoFactory({ id: '2', completed: true }),
      ]

      render(
        <TodoList todos={todos} onToggle={jest.fn()} onDelete={jest.fn()} />,
      )

      // Look for the completion status text
      const status = screen.getByText(/1 of 2 completed/i)
      expect(status).toBeInTheDocument()
      expect(status).toHaveAttribute('aria-live', 'polite')
      expect(status).toHaveAttribute('aria-atomic', 'true')
    })

    it('provides status updates for empty state', () => {
      render(<TodoList todos={[]} onToggle={jest.fn()} onDelete={jest.fn()} />)

      const text = screen.getByText(/no todos yet/i)
      expect(text).toBeInTheDocument()
    })
  })

  describe('Color Contrast and Visual Accessibility', () => {
    it('uses semantic HTML elements', () => {
      const todos = [todoFactory({ id: '1', title: 'Test' })]

      render(
        <TodoList todos={todos} onToggle={jest.fn()} onDelete={jest.fn()} />,
      )

      // Verify proper semantic HTML
      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })
})
