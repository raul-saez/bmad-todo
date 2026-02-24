import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '@/app/page'
import { useTodos } from '@/hooks/useTodos'
import { todoFactory } from '@/__tests__/fixtures/todos.fixtures'

jest.mock('@/hooks/useTodos')

const mockUseTodos = useTodos as jest.MockedFunction<typeof useTodos>

describe('Home page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders heading, subtitle, and footer text', () => {
    mockUseTodos.mockReturnValue({
      todos: [],
      loading: false,
      error: null,
      createTodo: jest.fn(),
      updateTodo: jest.fn(),
      deleteTodo: jest.fn(),
    })

    render(<Home />)

    expect(
      screen.getByRole('heading', { name: /todo app/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/stay organized and track your tasks/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/built with next\.js, typescript, and tailwind css/i),
    ).toBeInTheDocument()
  })

  it('creates, toggles, and deletes todos via handlers', async () => {
    const user = userEvent.setup()
    const createTodo = jest.fn().mockResolvedValue(undefined)
    const updateTodo = jest.fn().mockResolvedValue(undefined)
    const deleteTodo = jest.fn().mockResolvedValue(undefined)

    const todo = todoFactory({ id: '1', title: 'Test Todo', completed: false })

    mockUseTodos.mockReturnValue({
      todos: [todo],
      loading: false,
      error: null,
      createTodo,
      updateTodo,
      deleteTodo,
    })

    render(<Home />)

    const input = screen.getByPlaceholderText(/enter a new todo/i)
    await user.type(input, 'New Todo')
    await user.click(screen.getByRole('button', { name: /add/i }))

    expect(createTodo).toHaveBeenCalledWith('New Todo')

    const checkbox = screen.getByLabelText(/mark "Test Todo" as complete/i)
    await user.click(checkbox)

    expect(updateTodo).toHaveBeenCalledWith('1', { completed: true })

    const deleteButton = screen.getByLabelText(/delete "Test Todo"/i)
    await user.click(deleteButton)

    expect(deleteTodo).toHaveBeenCalledWith('1')
  })
})
