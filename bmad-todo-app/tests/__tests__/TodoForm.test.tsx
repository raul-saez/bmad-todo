import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoForm } from '@/components/TodoForm'

describe('TodoForm', () => {
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form with input and submit button', () => {
    render(<TodoForm onSubmit={mockOnSubmit} />)
    expect(screen.getByLabelText(/add a new todo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
  })

  it('allows user to type in the input', async () => {
    const user = userEvent.setup()
    render(<TodoForm onSubmit={mockOnSubmit} />)
    const input = screen.getByPlaceholderText(/enter a new todo/i)

    await user.type(input, 'New todo')
    expect(input).toHaveValue('New todo')
  })

  it('calls onSubmit with title when form is submitted', async () => {
    const user = userEvent.setup()
    render(<TodoForm onSubmit={mockOnSubmit} />)

    const input = screen.getByPlaceholderText(/enter a new todo/i)
    await user.type(input, 'New todo')
    await user.click(screen.getByRole('button', { name: /add/i }))

    expect(mockOnSubmit).toHaveBeenCalledWith('New todo')
  })

  it('clears input after successful submission', async () => {
    const user = userEvent.setup()
    render(<TodoForm onSubmit={mockOnSubmit} />)

    const input = screen.getByPlaceholderText(
      /enter a new todo/i,
    ) as HTMLInputElement
    await user.type(input, 'New todo')
    await user.click(screen.getByRole('button', { name: /add/i }))

    expect(input.value).toBe('')
  })

  it('shows error for empty input', async () => {
    const user = userEvent.setup()
    render(<TodoForm onSubmit={mockOnSubmit} />)

    await user.click(screen.getByRole('button', { name: /add/i }))

    expect(screen.getByText(/title is required/i)).toBeInTheDocument()
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('prevents form submission on empty input', async () => {
    const user = userEvent.setup()
    render(<TodoForm onSubmit={mockOnSubmit} />)

    const input = screen.getByPlaceholderText(/enter a new todo/i)
    await user.clear(input)
    await user.click(screen.getByRole('button', { name: /add/i }))

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('disables input and button when submitting', async () => {
    render(<TodoForm onSubmit={mockOnSubmit} isSubmitting={true} />)

    const input = screen.getByPlaceholderText(/enter a new todo/i)
    const button = screen.getByRole('button')

    expect(input).toBeDisabled()
    expect(button).toBeDisabled()
  })

  it('enforces max length of 500 characters', () => {
    render(<TodoForm onSubmit={mockOnSubmit} />)
    const input = screen.getByPlaceholderText(
      /enter a new todo/i,
    ) as HTMLInputElement
    expect(input.maxLength).toBe(500)
  })
})
