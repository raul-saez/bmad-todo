/**
 * Storage Validation Layer
 *
 * Validates data before storing in IndexedDB or localStorage
 * Handles corrupted data gracefully
 */

import { z } from 'zod'
import { Todo } from '@/lib/schemas'

// Storage-specific schema with additional validation
// Accepts both Date objects and ISO date strings for serialization compatibility
export const StorageTodoSchema = z.object({
  id: z.string().min(1), // Relaxed from cuid() for testing and backwards compatibility
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must be less than 500 characters'),
  completed: z.boolean().default(false),
  createdAt: z.union([z.date(), z.string().datetime()]),
  updatedAt: z.union([z.date(), z.string().datetime()]),
  _version: z.number().optional(), // For future versioning
  _storedAt: z.number().optional(), // Timestamp when stored
})

export type StorageTodo = z.infer<typeof StorageTodoSchema>

/**
 * Validate a todo before storage
 */
export function validateTodoForStorage(data: unknown): {
  success: boolean
  data?: StorageTodo
  error?: z.ZodError
} {
  try {
    // Normalize the data first - convert Date objects to ISO strings if needed
    const normalizedData =
      typeof data === 'object' && data !== null
        ? {
            ...(data as Record<string, unknown>),
            createdAt:
              (data as any).createdAt instanceof Date
                ? (data as any).createdAt.toISOString()
                : typeof (data as any).createdAt === 'string'
                  ? (data as any).createdAt
                  : new Date((data as any).createdAt).toISOString(),
            updatedAt:
              (data as any).updatedAt instanceof Date
                ? (data as any).updatedAt.toISOString()
                : typeof (data as any).updatedAt === 'string'
                  ? (data as any).updatedAt
                  : new Date((data as any).updatedAt).toISOString(),
          }
        : data

    const result = StorageTodoSchema.safeParse(normalizedData)

    if (result.success) {
      return {
        success: true,
        data: {
          ...result.data,
          _version: 1,
          _storedAt: Date.now(),
        },
      }
    }

    return {
      success: false,
      error: result.error,
    }
  } catch (error) {
    // Handle date conversion errors
    return {
      success: false,
      error: new z.ZodError([
        {
          code: z.ZodIssueCode.custom,
          path: [],
          message: `Invalid date format: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ]),
    }
  }
}

/**
 * Validate an array of todos
 */
export function validateTodosForStorage(data: unknown): {
  success: boolean
  data?: StorageTodo[]
  error?: z.ZodError | Error
} {
  if (!Array.isArray(data)) {
    return {
      success: false,
      error: new Error('Data must be an array'),
    }
  }

  const validated: StorageTodo[] = []
  const errors: z.ZodError[] = []

  for (const item of data) {
    const result = validateTodoForStorage(item)
    if (result.success && result.data) {
      validated.push(result.data)
    } else if (result.error) {
      errors.push(result.error)
    }
  }

  // If any items are valid, return them (partial success)
  if (validated.length > 0) {
    if (errors.length > 0) {
      console.warn(
        `${errors.length} todos failed validation, ${validated.length} succeeded`,
      )
    }
    return {
      success: true,
      data: validated,
    }
  }

  return {
    success: false,
    error: errors[0] || new Error('No valid todos found'),
  }
}

/**
 * Sanitize corrupted data - attempt to recover what we can
 */
export function sanitizeCorruptedTodo(data: unknown): Todo | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  const obj = data as Record<string, unknown>

  try {
    // Try to construct a valid todo from partial data
    return {
      id: typeof obj.id === 'string' ? obj.id : crypto.randomUUID(),
      title: typeof obj.title === 'string' ? obj.title : 'Untitled',
      completed: typeof obj.completed === 'boolean' ? obj.completed : false,
      createdAt:
        obj.createdAt instanceof Date
          ? obj.createdAt
          : new Date(obj.createdAt as string | number),
      updatedAt:
        obj.updatedAt instanceof Date
          ? obj.updatedAt
          : new Date(obj.updatedAt as string | number),
    }
  } catch {
    return null
  }
}

/**
 * Handle storage corruption - attempt recovery
 */
export function handleStorageCorruption(error: unknown): {
  recovered: boolean
  data?: Todo[]
  message: string
} {
  console.error('Storage corruption detected:', error)

  try {
    // Attempt to recover data from localStorage backup
    const backup = localStorage.getItem('bmad-todo-backup')
    if (backup) {
      const parsed = JSON.parse(backup)
      const result = validateTodosForStorage(parsed)

      if (result.success && result.data) {
        return {
          recovered: true,
          data: result.data,
          message: 'Recovered from localStorage backup',
        }
      }
    }
  } catch (backupError) {
    console.error('Backup recovery failed:', backupError)
  }

  return {
    recovered: false,
    message: 'Unable to recover corrupted data',
  }
}

/**
 * Validate storage quota availability
 */
export async function checkStorageQuota(): Promise<{
  available: boolean
  usage?: number
  quota?: number
  percentage?: number
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate()
      const usage = estimate.usage || 0
      const quota = estimate.quota || 0
      const percentage = quota > 0 ? (usage / quota) * 100 : 0

      return {
        available: percentage < 90, // Warn if over 90% used
        usage,
        quota,
        percentage,
      }
    } catch (error) {
      console.error('Failed to check storage quota:', error)
    }
  }

  return { available: true }
}
