import { Todo } from '@/lib/schemas'
import { validateTodoForStorage } from './validation'
import * as localStorageFallback from './localStorage'

const DB_NAME = 'bmad-todo'
const DB_VERSION = 1
const STORE_NAME = 'todos'

export interface TodoRecord extends Todo {}

let indexedDBAvailable = true

/**
 * Check if IndexedDB is available
 */
export function isIndexedDBAvailable(): boolean {
  return indexedDBAvailable && typeof indexedDB !== 'undefined'
}

const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      reject(new Error('IndexedDB not available'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => {
      console.error('IndexedDB open error:', request.error)
      indexedDBAvailable = false
      reject(request.error)
    }
    request.onblocked = () => {
      console.warn('IndexedDB open blocked')
      reject(new Error('Database open blocked'))
    }
  })

const withStore = async <T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
  const db = await openDatabase()
  const transaction = db.transaction(STORE_NAME, mode)
  const store = transaction.objectStore(STORE_NAME)
  const request = callback(store)

  const result = await requestToPromise(request)
  db.close()
  return result
}

export const initDatabase = async (): Promise<void> => {
  const db = await openDatabase()
  db.close()
}

export const saveTodo = async (todo: TodoRecord): Promise<TodoRecord> => {
  // Validate before saving
  const validation = validateTodoForStorage(todo)
  if (!validation.success) {
    console.error('Validation failed:', validation.error)
    throw new Error('Invalid todo data')
  }

  try {
    return await withStore('readwrite', (store) => store.put(todo))
  } catch (error) {
    console.error('IndexedDB save failed, falling back to localStorage:', error)
    indexedDBAvailable = false
    await localStorageFallback.saveTodo(todo)
    return todo
  }
}

export const getTodo = async (id: string): Promise<TodoRecord | null> => {
  try {
    const result = await withStore('readonly', (store) => store.get(id))
    return result ?? null
  } catch (error) {
    console.error('IndexedDB get failed, falling back to localStorage:', error)
    indexedDBAvailable = false
    return await localStorageFallback.getTodo(id)
  }
}

export const getAllTodos = async (): Promise<TodoRecord[]> => {
  try {
    return await withStore('readonly', (store) => store.getAll())
  } catch (error) {
    console.error(
      'IndexedDB getAll failed, falling back to localStorage:',
      error,
    )
    indexedDBAvailable = false
    return await localStorageFallback.getAllTodos()
  }
}

export const updateTodo = async (
  id: string,
  updates: Partial<Omit<TodoRecord, 'id' | 'createdAt'>>,
): Promise<TodoRecord | null> => {
  const existing = await getTodo(id)
  if (!existing) {
    return null
  }

  // Strip metadata fields before updating
  const { _version, _storedAt, ...cleanExisting } = existing as any

  const updated: TodoRecord = {
    ...cleanExisting,
    ...updates,
    updatedAt: new Date(),
  }

  await saveTodo(updated)
  return updated
}

export const deleteTodo = async (id: string): Promise<void> => {
  try {
    await withStore('readwrite', (store) => store.delete(id))
  } catch (error) {
    console.error(
      'IndexedDB delete failed, falling back to localStorage:',
      error,
    )
    indexedDBAvailable = false
    await localStorageFallback.deleteTodo(id)
  }
}

export const clearAll = async (): Promise<void> => {
  try {
    await withStore('readwrite', (store) => store.clear())
  } catch (error) {
    console.error(
      'IndexedDB clear failed, falling back to localStorage:',
      error,
    )
    indexedDBAvailable = false
    await localStorageFallback.clearAll()
  }
}

export const storageConfig = {
  DB_NAME,
  DB_VERSION,
  STORE_NAME,
}
