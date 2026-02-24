import { render, screen, fireEvent } from '@testing-library/react'
import { TodoItem } from '@/components/TodoItem'

describe('TodoItem', () => {
  const mockProps = {
    id: '1',
    title: 'Test todo',
    completed: false,
    onToggle: jest.fn(),
    onDelete: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders todo item with title', () => {
    render(<TodoItem {...mockProps} />)
    expect(screen.getByText('Test todo')).toBeInTheDocument()
  })

  it('renders checkbox with correct initial state', () => {
    render(<TodoItem {...mockProps} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('renders checkbox as checked when completed', () => {
    render(<TodoItem {...mockProps} completed={true} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('calls onToggle when checkbox is clicked', () => {
    render(<TodoItem {...mockProps} />)
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    expect(mockProps.onToggle).toHaveBeenCalledWith('1')
  })

  it('calls onDelete when delete button is clicked', () => {
    render(<TodoItem {...mockProps} />)
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)
    expect(mockProps.onDelete).toHaveBeenCalledWith('1')
  })

  it('applies strikethrough style when completed', () => {
    const { container } = render(<TodoItem {...mockProps} completed={true} />)
    const titleSpan = container.querySelector('span')
    expect(titleSpan).toHaveClass('line-through', 'text-gray-400')
  })

  it('has proper accessibility labels', () => {
    render(<TodoItem {...mockProps} />)
    expect(
      screen.getByLabelText(/mark "Test todo" as complete/i),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/delete "Test todo"/i)).toBeInTheDocument()
  })
})
