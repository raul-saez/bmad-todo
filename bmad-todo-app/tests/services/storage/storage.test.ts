/** @jest-environment jsdom */

import { todoFactory } from '@/__tests__/fixtures/todos.fixtures'

const mockIndexedDb = {
  initDatabase: jest.fn(),
  saveTodo: jest.fn(),
  getTodo: jest.fn(),
  getAllTodos: jest.fn(),
  updateTodo: jest.fn(),
  deleteTodo: jest.fn(),
  clearAll: jest.fn(),
}

const mockLocalStorage = {
  saveTodo: jest.fn(),
  getTodo: jest.fn(),
  getAllTodos: jest.fn(),
  updateTodo: jest.fn(),
  deleteTodo: jest.fn(),
  clearAll: jest.fn(),
}

jest.mock('@/services/storage/indexedDB', () => mockIndexedDb)
jest.mock('@/services/storage/localStorage', () => mockLocalStorage)

describe('storage abstraction', () => {
  beforeEach(async () => {
    jest.resetModules()
    jest.clearAllMocks()
    Object.defineProperty(global, 'indexedDB', {
      value: {},
      writable: true,
    })
  })

  afterEach(() => {
    delete (global as any).indexedDB
  })

  const loadStorage = async () => {
    const storage = await import('@/services/storage/storage')
    storage.__resetStorageForTests()
    return storage
  }

  it('uses indexedDB when available', async () => {
    mockIndexedDb.initDatabase.mockResolvedValue(undefined)
    mockIndexedDb.getAllTodos.mockResolvedValue([])

    const storage = await loadStorage()
    await storage.initStorage()
    await storage.getAllTodos()

    expect(mockIndexedDb.initDatabase).toHaveBeenCalled()
    expect(mockIndexedDb.getAllTodos).toHaveBeenCalled()
  })

  it('falls back to localStorage when indexedDB init fails', async () => {
    mockIndexedDb.initDatabase.mockRejectedValue(new Error('nope'))
    mockLocalStorage.getAllTodos.mockResolvedValue([])

    const storage = await loadStorage()
    const provider = await storage.initStorage()
    await storage.getAllTodos()

    expect(provider).toBe('localStorage')
    expect(mockLocalStorage.getAllTodos).toHaveBeenCalled()
  })

  it('uses localStorage when indexedDB is unavailable', async () => {
    delete (global as any).indexedDB
    mockLocalStorage.getAllTodos.mockResolvedValue([])

    const storage = await loadStorage()
    const provider = await storage.initStorage()
    await storage.getAllTodos()

    expect(provider).toBe('localStorage')
    expect(mockLocalStorage.getAllTodos).toHaveBeenCalled()
  })

  it('backs up saves to localStorage when indexedDB is primary', async () => {
    const todo = todoFactory({ id: 'todo-1' })
    mockIndexedDb.initDatabase.mockResolvedValue(undefined)
    mockIndexedDb.saveTodo.mockResolvedValue(todo)
    mockLocalStorage.saveTodo.mockResolvedValue(todo)

    const storage = await loadStorage()
    await storage.saveTodo(todo)

    expect(mockIndexedDb.saveTodo).toHaveBeenCalledWith(todo)
    expect(mockLocalStorage.saveTodo).toHaveBeenCalledWith(todo)
  })

  it('falls back to localStorage when indexedDB save fails', async () => {
    const todo = todoFactory({ id: 'todo-1' })
    mockIndexedDb.initDatabase.mockResolvedValue(undefined)
    mockIndexedDb.saveTodo.mockRejectedValue(new Error('fail'))
    mockLocalStorage.saveTodo.mockResolvedValue(todo)

    const storage = await loadStorage()
    const saved = await storage.saveTodo(todo)

    expect(saved).toEqual(todo)
    expect(mockLocalStorage.saveTodo).toHaveBeenCalledWith(todo)
  })

  it('backs up updates to localStorage when indexedDB is primary', async () => {
    const todo = todoFactory({ id: 'todo-1', completed: false })
    const updated = { ...todo, completed: true }
    mockIndexedDb.initDatabase.mockResolvedValue(undefined)
    mockIndexedDb.updateTodo.mockResolvedValue(updated)
    mockLocalStorage.saveTodo.mockResolvedValue(updated)

    const storage = await loadStorage()
    const result = await storage.updateTodo('todo-1', { completed: true })

    expect(result).toEqual(updated)
    expect(mockIndexedDb.updateTodo).toHaveBeenCalledWith('todo-1', {
      completed: true,
    })
    expect(mockLocalStorage.saveTodo).toHaveBeenCalledWith(updated)
  })

  it('falls back to localStorage when indexedDB get fails', async () => {
    mockIndexedDb.initDatabase.mockResolvedValue(undefined)
    mockIndexedDb.getTodo.mockRejectedValue(new Error('fail'))
    mockLocalStorage.getTodo.mockResolvedValue(null)

    const storage = await loadStorage()
    const result = await storage.getTodo('todo-1')

    expect(result).toBeNull()
    expect(mockLocalStorage.getTodo).toHaveBeenCalledWith('todo-1')
  })

  it('removes todos from localStorage backup on delete', async () => {
    mockIndexedDb.initDatabase.mockResolvedValue(undefined)
    mockIndexedDb.deleteTodo.mockResolvedValue(undefined)
    mockLocalStorage.deleteTodo.mockResolvedValue(undefined)

    const storage = await loadStorage()
    await storage.deleteTodo('todo-1')

    expect(mockIndexedDb.deleteTodo).toHaveBeenCalledWith('todo-1')
    expect(mockLocalStorage.deleteTodo).toHaveBeenCalledWith('todo-1')
  })

  it('clears localStorage backup when indexedDB clears', async () => {
    mockIndexedDb.initDatabase.mockResolvedValue(undefined)
    mockIndexedDb.clearAll.mockResolvedValue(undefined)
    mockLocalStorage.clearAll.mockResolvedValue(undefined)

    const storage = await loadStorage()
    await storage.clearAll()

    expect(mockIndexedDb.clearAll).toHaveBeenCalled()
    expect(mockLocalStorage.clearAll).toHaveBeenCalled()
  })
})
