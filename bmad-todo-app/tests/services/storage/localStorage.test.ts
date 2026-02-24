import {
  clearAll,
  deleteTodo,
  getAllTodos,
  getTodo,
  saveTodo,
  storageConfig,
  updateTodo,
} from '@/services/storage/localStorage'
import { todoFactory } from '@/__tests__/fixtures/todos.fixtures'

describe('localStorage storage service', () => {
  beforeEach(async () => {
    localStorage.clear()
    await clearAll()
  })

  it('saves and retrieves a todo', async () => {
    const todo = todoFactory({ id: 'todo-1' })
    await saveTodo(todo)

    const fetched = await getTodo('todo-1')
    expect(fetched).toMatchObject({
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
    })
  })

  it('returns null for missing todo', async () => {
    const fetched = await getTodo('missing')
    expect(fetched).toBeNull()
  })

  it('returns all todos', async () => {
    const first = todoFactory({ id: 'todo-1', title: 'First' })
    const second = todoFactory({ id: 'todo-2', title: 'Second' })

    await saveTodo(first)
    await saveTodo(second)

    const all = await getAllTodos()
    expect(all).toHaveLength(2)
    expect(all[0]).toMatchObject({ id: first.id, title: first.title })
    expect(all[1]).toMatchObject({ id: second.id, title: second.title })
  })

  it('updates an existing todo', async () => {
    const todo = todoFactory({ id: 'todo-1', completed: false })
    await saveTodo(todo)

    const updated = await updateTodo('todo-1', { completed: true })

    expect(updated).not.toBeNull()
    expect(updated?.completed).toBe(true)
    expect(updated?.updatedAt).not.toEqual(todo.updatedAt)
  })

  it('returns null when updating missing todo', async () => {
    const updated = await updateTodo('missing', { completed: true })
    expect(updated).toBeNull()
  })

  it('deletes a todo', async () => {
    const todo = todoFactory({ id: 'todo-1' })
    await saveTodo(todo)

    await deleteTodo('todo-1')

    const fetched = await getTodo('todo-1')
    expect(fetched).toBeNull()
  })

  it('clears all todos', async () => {
    await saveTodo(todoFactory({ id: 'todo-1' }))
    await saveTodo(todoFactory({ id: 'todo-2' }))

    await clearAll()

    const all = await getAllTodos()
    expect(all).toHaveLength(0)
  })

  it('recovers from corrupted JSON', async () => {
    localStorage.setItem(storageConfig.STORAGE_KEY, '{bad json')

    const all = await getAllTodos()

    expect(all).toHaveLength(0)
    expect(localStorage.getItem(storageConfig.STORAGE_KEY)).toBeNull()
  })
})
