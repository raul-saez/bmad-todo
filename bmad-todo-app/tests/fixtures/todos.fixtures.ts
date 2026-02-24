export const baseTodo = {
  id: '1',
  title: 'Test todo',
  completed: false,
  createdAt: new Date('2026-02-24'),
  updatedAt: new Date('2026-02-24'),
}

export const todoFactory = (overrides?: Partial<typeof baseTodo>) => ({
  ...baseTodo,
  ...overrides,
})

export const completedTodo = todoFactory({ completed: true })

export const multipleTodos = [
  todoFactory({ id: '1', title: 'Buy groceries' }),
  todoFactory({ id: '2', title: 'Finish project', completed: true }),
  todoFactory({ id: '3', title: 'Call dentist' }),
]

export const emptyTodoList: (typeof baseTodo)[] = []
