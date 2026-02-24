/** @jest-environment jsdom */

import { todoFactory } from '@/__tests__/fixtures/todos.fixtures'
import * as storage from '@/services/storage/storage'
import { storageConfig } from '@/services/storage/localStorage'

describe('storage integration scenarios', () => {
  beforeEach(async () => {
    storage.__resetStorageForTests()
    localStorage.clear()
    delete (global as any).indexedDB
  })

  it('persists todos and reloads them on init (crash recovery)', async () => {
    const todo = todoFactory({ id: 'todo-1' })

    await storage.saveTodo(todo)
    storage.__resetStorageForTests()

    await storage.initStorage()
    const recovered = await storage.getAllTodos()

    expect(recovered).toHaveLength(1)
    expect(recovered[0]).toMatchObject({
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
    })
  })

  it('falls back to localStorage when indexedDB is unavailable', async () => {
    const todo = todoFactory({ id: 'todo-2' })
    await storage.saveTodo(todo)

    const raw = localStorage.getItem(storageConfig.STORAGE_KEY)
    expect(raw).toContain('todo-2')
  })

  it('recovers from corrupted localStorage data', async () => {
    localStorage.setItem(storageConfig.STORAGE_KEY, '{bad json')

    const todos = await storage.getAllTodos()

    expect(todos).toHaveLength(0)
    expect(localStorage.getItem(storageConfig.STORAGE_KEY)).toBeNull()
  })
})
