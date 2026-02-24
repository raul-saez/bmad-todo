import { Todo } from '@/lib/schemas'

export const baseTodo: Todo = {
  id: 'test-1',
  title: 'Test Todo',
  completed: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export function todoFactory(overrides?: Partial<Todo>): Todo {
  return {
    ...baseTodo,
    id: Math.random().toString(36).substr(2, 9),
    ...overrides,
  }
}

export const mockTodos = {
  pending: [
    todoFactory({ title: 'Learn React' }),
    todoFactory({ title: 'Build a project' }),
  ],
  completed: [todoFactory({ title: 'Setup environment', completed: true })],
  mixed: [
    todoFactory({ title: 'Morning jog', completed: true }),
    todoFactory({ title: 'Buy groceries' }),
    todoFactory({ title: 'Complete PR review' }),
  ],
}
