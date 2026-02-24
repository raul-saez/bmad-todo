import { Todo } from '@/lib/schemas'
import { validateTodosForStorage, validateTodoForStorage } from './validation'

const STORAGE_KEY = 'bmad-todos'
const BACKUP_KEY = 'bmad-todos-backup'
const METADATA_KEY = 'bmad-todos-metadata'

export interface TodoRecord extends Todo {}

export interface StorageMetadata {
  lastSync: number
  version: number
  itemCount: number
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

const normalizeTodo = (todo: TodoRecord): TodoRecord => ({
  ...todo,
  createdAt:
    typeof todo.createdAt === 'string'
      ? new Date(todo.createdAt)
      : todo.createdAt,
  updatedAt:
    typeof todo.updatedAt === 'string'
      ? new Date(todo.updatedAt)
      : todo.updatedAt,
})

const readTodos = (): TodoRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    let parsed: TodoRecord[]
    try {
      parsed = JSON.parse(raw) as TodoRecord[]
    } catch (parseError) {
      // Main storage has invalid JSON, try backup
      console.warn('Main storage corrupted, attempting backup recovery')
      const backup = localStorage.getItem(BACKUP_KEY)
      if (backup) {
        try {
          const backupParsed = JSON.parse(backup) as TodoRecord[]
          const backupValidation = validateTodosForStorage(backupParsed)
          if (backupValidation.success && backupValidation.data) {
            // Restore from backup
            writeTodos(backupValidation.data as TodoRecord[])
            return backupValidation.data.map(normalizeTodo)
          }
        } catch (backupError) {
          console.warn('Backup also corrupted')
        }
      }
      console.warn('localStorage data corrupted and backup failed, resetting')
      localStorage.removeItem(STORAGE_KEY)
      return []
    }

    // Validate data
    const validation = validateTodosForStorage(parsed)
    if (validation.success && validation.data) {
      return validation.data.map(normalizeTodo)
    }

    // Data structure invalid, try backup
    console.warn('Main storage invalid, attempting backup recovery')
    const backup = localStorage.getItem(BACKUP_KEY)
    if (backup) {
      const backupParsed = JSON.parse(backup) as TodoRecord[]
      const backupValidation = validateTodosForStorage(backupParsed)
      if (backupValidation.success && backupValidation.data) {
        // Restore from backup
        writeTodos(backupValidation.data as TodoRecord[])
        return backupValidation.data.map(normalizeTodo)
      }
    }

    console.warn('localStorage data corrupted and backup failed, resetting')
    localStorage.removeItem(STORAGE_KEY)
    return []
  } catch (error) {
    console.warn('localStorage read error, resetting', error)
    localStorage.removeItem(STORAGE_KEY)
    return []
  }
}

const writeTodos = (todos: TodoRecord[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  // Create backup
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(todos))
  } catch (error) {
    console.warn('Failed to create backup:', error)
  }
  // Update metadata
  updateMetadata(todos.length)
}

function updateMetadata(itemCount: number): void {
  try {
    const metadata: StorageMetadata = {
      lastSync: Date.now(),
      version: 1,
      itemCount,
    }
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata))
  } catch (error) {
    console.warn('Failed to update metadata:', error)
  }
}

export function getMetadata(): StorageMetadata | null {
  try {
    const data = localStorage.getItem(METADATA_KEY)
    if (!data) return null
    return JSON.parse(data) as StorageMetadata
  } catch {
    return null
  }
}

export const saveTodo = async (todo: TodoRecord): Promise<TodoRecord> => {
  const todos = readTodos()
  const index = todos.findIndex((item) => item.id === todo.id)

  if (index >= 0) {
    todos[index] = todo
  } else {
    todos.push(todo)
  }

  writeTodos(todos)
  return todo
}

export const getTodo = async (id: string): Promise<TodoRecord | null> => {
  const todos = readTodos()
  return todos.find((item) => item.id === id) ?? null
}

export const getAllTodos = async (): Promise<TodoRecord[]> => {
  return readTodos()
}

export const updateTodo = async (
  id: string,
  updates: Partial<Omit<TodoRecord, 'id' | 'createdAt'>>,
): Promise<TodoRecord | null> => {
  const todos = readTodos()
  const index = todos.findIndex((item) => item.id === id)

  if (index === -1) {
    return null
  }

  // Strip metadata fields before updating
  const { _version, _storedAt, ...cleanExisting } = todos[index] as any

  const updated: TodoRecord = {
    ...cleanExisting,
    ...updates,
    updatedAt: new Date(),
  }

  todos[index] = updated
  writeTodos(todos)
  return updated
}

export const deleteTodo = async (id: string): Promise<void> => {
  const todos = readTodos().filter((item) => item.id !== id)
  writeTodos(todos)
}

export const clearAll = async (): Promise<void> => {
  localStorage.removeItem(STORAGE_KEY)
}

export const storageConfig = {
  STORAGE_KEY,
}
