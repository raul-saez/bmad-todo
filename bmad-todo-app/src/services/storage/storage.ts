import type { Todo } from '@/lib/schemas'
import * as indexedDbStorage from './indexedDB'
import * as localStorageService from './localStorage'

export type StorageProvider = 'indexedDB' | 'localStorage'

let activeProvider: StorageProvider | null = null

const isIndexedDBAvailable = () => typeof indexedDB !== 'undefined'

const setProvider = (provider: StorageProvider) => {
  activeProvider = provider
}

const ensureProvider = async (): Promise<StorageProvider> => {
  if (activeProvider) {
    return activeProvider
  }

  if (!isIndexedDBAvailable()) {
    setProvider('localStorage')
    return 'localStorage'
  }

  try {
    await indexedDbStorage.initDatabase()
    setProvider('indexedDB')
    return 'indexedDB'
  } catch (error) {
    console.warn('IndexedDB unavailable, falling back to localStorage', error)
    setProvider('localStorage')
    return 'localStorage'
  }
}

const withFallback = async <T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> => {
  try {
    return await primary()
  } catch (error) {
    console.warn('Primary storage failed, falling back to localStorage', error)
    setProvider('localStorage')
    return fallback()
  }
}

export const getActiveStorage = (): StorageProvider | null => activeProvider

export const initStorage = async (): Promise<StorageProvider> => {
  return ensureProvider()
}

export const saveTodo = async (todo: Todo): Promise<Todo> => {
  const provider = await ensureProvider()

  if (provider === 'indexedDB') {
    const saved = await withFallback(
      () => indexedDbStorage.saveTodo(todo),
      () => localStorageService.saveTodo(todo),
    )

    try {
      await localStorageService.saveTodo(todo)
    } catch (error) {
      console.warn('Failed to backup todo to localStorage', error)
    }

    return saved
  }

  return localStorageService.saveTodo(todo)
}

export const getTodo = async (id: string): Promise<Todo | null> => {
  const provider = await ensureProvider()

  if (provider === 'indexedDB') {
    return withFallback(
      () => indexedDbStorage.getTodo(id),
      () => localStorageService.getTodo(id),
    )
  }

  return localStorageService.getTodo(id)
}

export const getAllTodos = async (): Promise<Todo[]> => {
  const provider = await ensureProvider()

  if (provider === 'indexedDB') {
    return withFallback(
      () => indexedDbStorage.getAllTodos(),
      () => localStorageService.getAllTodos(),
    )
  }

  return localStorageService.getAllTodos()
}

export const updateTodo = async (
  id: string,
  updates: Partial<Omit<Todo, 'id' | 'createdAt'>>,
): Promise<Todo | null> => {
  const provider = await ensureProvider()

  if (provider === 'indexedDB') {
    const updated = await withFallback(
      () => indexedDbStorage.updateTodo(id, updates),
      () => localStorageService.updateTodo(id, updates),
    )

    if (updated) {
      try {
        await localStorageService.saveTodo(updated)
      } catch (error) {
        console.warn('Failed to backup updated todo to localStorage', error)
      }
    }

    return updated
  }

  return localStorageService.updateTodo(id, updates)
}

export const deleteTodo = async (id: string): Promise<void> => {
  const provider = await ensureProvider()

  if (provider === 'indexedDB') {
    await withFallback(
      () => indexedDbStorage.deleteTodo(id),
      () => localStorageService.deleteTodo(id),
    )

    try {
      await localStorageService.deleteTodo(id)
    } catch (error) {
      console.warn('Failed to remove todo from localStorage backup', error)
    }

    return
  }

  await localStorageService.deleteTodo(id)
}

export const clearAll = async (): Promise<void> => {
  const provider = await ensureProvider()

  if (provider === 'indexedDB') {
    await withFallback(
      () => indexedDbStorage.clearAll(),
      () => localStorageService.clearAll(),
    )

    try {
      await localStorageService.clearAll()
    } catch (error) {
      console.warn('Failed to clear localStorage backup', error)
    }

    return
  }

  await localStorageService.clearAll()
}

export const __resetStorageForTests = () => {
  activeProvider = null
}
