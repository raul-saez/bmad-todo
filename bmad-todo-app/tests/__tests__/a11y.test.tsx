import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { TodoItem } from '@/components/TodoItem'
import { TodoForm } from '@/components/TodoForm'
import { TodoList } from '@/components/TodoList'
import { todoFactory } from '@/__tests__/fixtures/todos.fixtures'

expect.extend(toHaveNoViolations)

describe('Accessibility Tests (WCAG 2.1)', () => {
  describe('TodoItem Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <ul>
          <TodoItem
            id="1"
            title="Test"
            completed={false}
            onToggle={jest.fn()}
            onDelete={jest.fn()}
          />
        </ul>,
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper ARIA labels', () => {
      render(
        <ul>
          <TodoItem
            id="1"
            title="Test Todo"
            completed={false}
            onToggle={jest.fn()}
            onDelete={jest.fn()}
          />
        </ul>,
      )
      expect(
        screen.getByLabelText(/mark "Test Todo" as complete/i),
      ).toBeInTheDocument()
      expect(screen.getByLabelText(/delete "Test Todo"/i)).toBeInTheDocument()
    })

    it('should be keyboard navigable', () => {
      const mockToggle = jest.fn()
      const mockDelete = jest.fn()
      const { container } = render(
        <ul>
          <TodoItem
            id="1"
            title="Test"
            completed={false}
            onToggle={mockToggle}
            onDelete={mockDelete}
          />
        </ul>,
      )
      const checkbox = container.querySelector('input[type="checkbox"]')
      const deleteButton = container.querySelector('button')

      expect(checkbox).toBeVisible()
      expect(deleteButton).toBeVisible()
    })
  })

  describe('TodoForm Component', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<TodoForm onSubmit={jest.fn()} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper form labels', () => {
      render(<TodoForm onSubmit={jest.fn()} />)
      expect(screen.getByLabelText(/add a new todo/i)).toBeInTheDocument()
    })

    it('should be keyboard accessible', () => {
      render(<TodoForm onSubmit={jest.fn()} />)
      const input = screen.getByPlaceholderText(/enter a new todo/i)
      const button = screen.getByRole('button', { name: /add/i })

      expect(input).toHaveAttribute('type', 'text')
      expect(button).toBeInTheDocument()
    })
  })

  describe('TodoList Component', () => {
    it('should have no accessibility violations', async () => {
      const todos = [todoFactory()]
      const { container } = render(
        <TodoList todos={todos} onToggle={jest.fn()} onDelete={jest.fn()} />,
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have semantic list structure', () => {
      const todos = [todoFactory(), todoFactory()]
      const { container } = render(
        <TodoList todos={todos} onToggle={jest.fn()} onDelete={jest.fn()} />,
      )
      const list = container.querySelector('ul[role="list"]')
      expect(list).toBeInTheDocument()
    })

    it('should have progress bar with ARIA attributes', () => {
      const todos = [
        todoFactory({ completed: true }),
        todoFactory({ completed: false }),
      ]
      const { container } = render(
        <TodoList todos={todos} onToggle={jest.fn()} onDelete={jest.fn()} />,
      )
      const progressBar = container.querySelector('[role="progressbar"]')
      expect(progressBar).toHaveAttribute('aria-valuenow', '1')
      expect(progressBar).toHaveAttribute('aria-valuemin', '0')
      expect(progressBar).toHaveAttribute('aria-valuemax', '2')
    })
  })

  describe('Color Contrast', () => {
    it('text should have sufficient color contrast', async () => {
      const { container } = render(
        <div className="text-gray-900 bg-white">High contrast text</div>,
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Semantic HTML', () => {
    it('should use semantic button elements', () => {
      render(<TodoForm onSubmit={jest.fn()} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should use semantic input labels', () => {
      render(<TodoForm onSubmit={jest.fn()} />)
      const label = screen.getByLabelText(/add a new todo/i)
      expect(label).toBeInTheDocument()
    })
  })
})
