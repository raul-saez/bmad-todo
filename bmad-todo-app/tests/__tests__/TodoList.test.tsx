import { render, screen } from '@testing-library/react'
import { TodoList } from '@/components/TodoList'
import { todoFactory } from '@/__tests__/fixtures/todos.fixtures'

describe('TodoList', () => {
  const mockOnToggle = jest.fn()
  const mockOnDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders empty state when no todos', () => {
    render(
      <TodoList todos={[]} onToggle={mockOnToggle} onDelete={mockOnDelete} />,
    )
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument()
  })

  it('renders loading state', () => {
    render(
      <TodoList
        todos={[]}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        isLoading={true}
      />,
    )
    expect(screen.getByText(/loading todos/i)).toBeInTheDocument()
  })

  it('renders error state', () => {
    const errorMessage = 'Failed to load'
    render(
      <TodoList
        todos={[]}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        error={errorMessage}
      />,
    )
    expect(screen.getByText(/error loading todos/i)).toBeInTheDocument()
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('renders list of todos', () => {
    const todos = [
      todoFactory({ title: 'Todo 1' }),
      todoFactory({ title: 'Todo 2' }),
    ]
    render(
      <TodoList
        todos={todos}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />,
    )

    expect(screen.getByText('Todo 1')).toBeInTheDocument()
    expect(screen.getByText('Todo 2')).toBeInTheDocument()
  })

  it('shows progress bar with completion count', () => {
    const todos = [
      todoFactory({ completed: true }),
      todoFactory({ completed: false }),
    ]
    render(
      <TodoList
        todos={todos}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />,
    )

    expect(screen.getByText(/1 of 2 completed/i)).toBeInTheDocument()
  })

  it('renders list with role list', () => {
    const todos = [todoFactory()]
    const { container } = render(
      <TodoList
        todos={todos}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />,
    )

    expect(container.querySelector('ul[role="list"]')).toBeInTheDocument()
  })
})
