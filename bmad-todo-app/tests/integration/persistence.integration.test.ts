/**
 * Integration Tests for Persistence Layer
 *
 * Tests crash recovery, storage fallback, and data integrity
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals'
import * as crashRecovery from '@/services/storage/crashRecovery'
import * as validation from '@/services/storage/validation'
import * as indexedDB from '@/services/storage/indexedDB'
import * as localStorage from '@/services/storage/localStorage'
import { Todo } from '@/lib/schemas'

describe('Persistence Layer Integration Tests', () => {
  const mockTodo: Todo = {
    id: 'test-todo-1',
    title: 'Test Todo',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    // Clear all storage before each test
    global.localStorage.clear()
    crashRecovery.clearRecoveryState()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Crash Recovery', () => {
    it('should detect a crash when heartbeat stops', () => {
      // Save initial state
      crashRecovery.saveRecoveryState({
        lastActive: Date.now() - 10000, // 10 seconds ago
        pendingOperations: [],
      })

      // Check for crash
      const hasCrashed = crashRecovery.detectCrash()
      expect(hasCrashed).toBe(true)
    })

    it('should not detect crash with recent heartbeat', () => {
      // Save recent state
      crashRecovery.saveRecoveryState({
        lastActive: Date.now() - 1000, // 1 second ago
        pendingOperations: [],
      })

      // Check for crash
      const hasCrashed = crashRecovery.detectCrash()
      expect(hasCrashed).toBe(false)
    })

    it('should save and recover pending operations', () => {
      // Add pending operations
      crashRecovery.addPendingOperation('create', 'todo-1', mockTodo)
      crashRecovery.addPendingOperation('update', 'todo-2')
      crashRecovery.addPendingOperation('delete', 'todo-3')

      // Get pending operations
      const operations = crashRecovery.getPendingOperations()

      expect(operations).toHaveLength(3)
      expect(operations[0].type).toBe('create')
      expect(operations[0].todoId).toBe('todo-1')
      // Dates are serialized, so don't deep compare
      expect(operations[0].data?.id).toBe(mockTodo.id)
    })

    it('should clear pending operations after recovery', () => {
      // Add and recover operations
      crashRecovery.addPendingOperation('create', 'todo-1')
      const firstRecovery = crashRecovery.getPendingOperations()
      expect(firstRecovery).toHaveLength(1)

      // Second recovery should return empty array
      const secondRecovery = crashRecovery.getPendingOperations()
      expect(secondRecovery).toHaveLength(0)
    })

    it('should maintain heartbeat updates', (done) => {
      const stopHeartbeat = crashRecovery.startHeartbeat()

      // Wait for heartbeat to update
      setTimeout(() => {
        const state = crashRecovery.loadRecoveryState()
        expect(state).not.toBeNull()
        expect(state?.lastActive).toBeGreaterThan(Date.now() - 2000)

        stopHeartbeat()
        done()
      }, 1500)
    })
  })

  describe('Data Validation', () => {
    it('should validate valid todo data', () => {
      const result = validation.validateTodoForStorage(mockTodo)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?._version).toBe(1)
      expect(result.data?._storedAt).toBeDefined()
    })

    it('should reject invalid todo data', () => {
      const invalidTodo = {
        id: 'test',
        title: '', // Empty title
        completed: 'not-a-boolean', // Invalid type
      }

      const result = validation.validateTodoForStorage(invalidTodo)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should validate array of todos with partial success', () => {
      const todos = [
        mockTodo,
        { id: 'invalid', title: '', completed: false }, // Invalid
        {
          ...mockTodo,
          id: 'test-todo-2',
          title: 'Valid Todo 2',
        },
      ]

      const result = validation.validateTodosForStorage(todos)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2) // Only valid todos
    })

    it('should sanitize corrupted todo data', () => {
      const corruptedTodo = {
        id: 'test',
        title: 'Test',
        completed: false,
        createdAt: 'invalid-date',
        updatedAt: Date.now(),
      }

      const sanitized = validation.sanitizeCorruptedTodo(corruptedTodo)

      expect(sanitized).not.toBeNull()
      expect(sanitized?.id).toBe('test')
      expect(sanitized?.title).toBe('Test')
    })

    it('should handle storage corruption with backup recovery', () => {
      // Create a backup
      global.localStorage.setItem(
        'bmad-todo-backup',
        JSON.stringify([mockTodo]),
      )

      const result = validation.handleStorageCorruption(
        new Error('Corrupted data'),
      )

      expect(result.recovered).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.message).toContain('backup')
    })
  })

  describe('localStorage Fallback', () => {
    it('should check localStorage availability', () => {
      const available = localStorage.isLocalStorageAvailable()
      expect(available).toBe(true)
    })

    it('should save and retrieve todos from localStorage', async () => {
      await localStorage.saveTodo(mockTodo)

      const todos = await localStorage.getAllTodos()

      expect(todos).toHaveLength(1)
      expect(todos[0].id).toBe(mockTodo.id)
    })

    it('should update existing todo in localStorage', async () => {
      await localStorage.saveTodo(mockTodo)

      const updated = { ...mockTodo, title: 'Updated Title' }
      await localStorage.saveTodo(updated)

      const todos = await localStorage.getAllTodos()

      expect(todos).toHaveLength(1)
      expect(todos[0].title).toBe('Updated Title')
    })

    it('should delete todo from localStorage', async () => {
      await localStorage.saveTodo(mockTodo)
      await localStorage.deleteTodo(mockTodo.id)

      const todos = await localStorage.getAllTodos()

      expect(todos).toHaveLength(0)
    })

    it('should create backup when saving', async () => {
      await localStorage.saveTodo(mockTodo)

      const backup = global.localStorage.getItem('bmad-todos-backup')
      expect(backup).not.toBeNull()

      const parsed = JSON.parse(backup!)
      expect(parsed).toHaveLength(1)
    })

    it('should update metadata on changes', async () => {
      await localStorage.saveTodo(mockTodo)

      const metadata = localStorage.getMetadata()

      expect(metadata).not.toBeNull()
      expect(metadata?.itemCount).toBe(1)
      expect(metadata?.version).toBe(1)
      expect(metadata?.lastSync).toBeGreaterThan(0)
    })

    it('should recover from corrupted data using backup', async () => {
      // Set up good backup with ISO date strings (as they would be after JSON serialization)
      const serializedTodo = {
        ...mockTodo,
        createdAt: mockTodo.createdAt.toISOString(),
        updatedAt: mockTodo.updatedAt.toISOString(),
      }
      global.localStorage.setItem(
        'bmad-todos-backup',
        JSON.stringify([serializedTodo]),
      )

      // Corrupt main storage
      global.localStorage.setItem('bmad-todos', 'corrupted-data')

      // Should recover from backup
      const todos = await localStorage.getAllTodos()

      expect(todos).toHaveLength(1)
      expect(todos[0].id).toBe(mockTodo.id)
    })
  })

  describe('IndexedDB with Fallback', () => {
    it('should check IndexedDB availability', () => {
      const available = indexedDB.isIndexedDBAvailable()
      // In test environment, IndexedDB might not be available
      expect(typeof available).toBe('boolean')
    })

    it('should fallback to localStorage when IndexedDB fails', async () => {
      // This test assumes IndexedDB is not available in test environment
      // The fallback should automatically kick in

      await indexedDB.saveTodo(mockTodo)

      // Check localStorage was used as fallback
      const localTodos = await localStorage.getAllTodos()
      expect(localTodos.length).toBeGreaterThan(0)
    })
  })

  describe('Storage Consistency', () => {
    it('should maintain consistency between storage types', async () => {
      // Save to both storage types
      await indexedDB.saveTodo(mockTodo)
      await localStorage.saveTodo(mockTodo)

      // Retrieve from both
      const indexedDBTodos = await indexedDB.getAllTodos()
      const localTodos = await localStorage.getAllTodos()

      // Should have same data
      expect(indexedDBTodos).toHaveLength(localTodos.length)
      expect(indexedDBTodos[0]?.id).toBe(localTodos[0]?.id)
    })

    it('should handle storage quota checks', async () => {
      const quota = await validation.checkStorageQuota()

      expect(quota.available).toBeDefined()
      expect(typeof quota.available).toBe('boolean')
    })
  })

  describe('Full Recovery Workflow', () => {
    it('should simulate and recover from browser crash', async () => {
      // 1. Simulate active session with pending operations
      crashRecovery.updateHeartbeat()
      crashRecovery.addPendingOperation('create', 'todo-1', mockTodo)

      // 2. Simulate crash (stop heartbeat for > 5 seconds)
      const state = crashRecovery.loadRecoveryState()
      if (state) {
        state.lastActive = Date.now() - 10000
        crashRecovery.saveRecoveryState(state)
      }

      // 3. Initialize recovery on "restart"
      const { hasCrashed, pendingOperations } =
        await crashRecovery.initializeCrashRecovery()

      // 4. Verify crash was detected and operations recovered
      expect(hasCrashed).toBe(true)
      expect(pendingOperations).toHaveLength(1)
      expect(pendingOperations[0].type).toBe('create')
    })

    it('should handle clean session without crash', async () => {
      // Initialize fresh recovery
      const { hasCrashed, pendingOperations } =
        await crashRecovery.initializeCrashRecovery()

      expect(hasCrashed).toBe(false)
      expect(pendingOperations).toHaveLength(0)
    })
  })
})
