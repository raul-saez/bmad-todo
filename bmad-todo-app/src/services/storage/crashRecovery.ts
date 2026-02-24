/**
 * Service Worker Registration and Crash Recovery
 *
 * This module handles:
 * - Service worker registration
 * - Crash detection and recovery
 * - Recovery state management
 */

export interface RecoveryState {
  lastActive: number
  pendingOperations: Array<{
    type: 'create' | 'update' | 'delete'
    todoId?: string
    data?: unknown
  }>
}

const RECOVERY_KEY = 'bmad-todo-recovery'
const CRASH_THRESHOLD_MS = 5000 // 5 seconds without heartbeat = crash

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    console.log('Service Worker registered:', registration)

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            console.log('New Service Worker available')
          }
        })
      }
    })

    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return null
  }
}

/**
 * Save recovery state to localStorage
 */
export function saveRecoveryState(state: RecoveryState): void {
  try {
    localStorage.setItem(RECOVERY_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save recovery state:', error)
  }
}

/**
 * Load recovery state from localStorage
 */
export function loadRecoveryState(): RecoveryState | null {
  try {
    const data = localStorage.getItem(RECOVERY_KEY)
    if (!data) return null
    return JSON.parse(data) as RecoveryState
  } catch (error) {
    console.error('Failed to load recovery state:', error)
    return null
  }
}

/**
 * Clear recovery state
 */
export function clearRecoveryState(): void {
  try {
    localStorage.removeItem(RECOVERY_KEY)
  } catch (error) {
    console.error('Failed to clear recovery state:', error)
  }
}

/**
 * Check if there was a crash (last active > threshold)
 */
export function detectCrash(): boolean {
  const state = loadRecoveryState()
  if (!state) return false

  const timeSinceActive = Date.now() - state.lastActive
  return timeSinceActive > CRASH_THRESHOLD_MS
}

/**
 * Update heartbeat timestamp
 */
export function updateHeartbeat(): void {
  const state = loadRecoveryState() || {
    lastActive: Date.now(),
    pendingOperations: [],
  }
  state.lastActive = Date.now()
  saveRecoveryState(state)
}

/**
 * Start heartbeat interval
 */
export function startHeartbeat(): () => void {
  const intervalId = setInterval(updateHeartbeat, 1000) // Update every second

  // Initial heartbeat
  updateHeartbeat()

  // Return cleanup function
  return () => {
    clearInterval(intervalId)
    clearRecoveryState()
  }
}

/**
 * Add a pending operation to recovery state
 */
export function addPendingOperation(
  type: 'create' | 'update' | 'delete',
  todoId?: string,
  data?: unknown,
): void {
  const state = loadRecoveryState() || {
    lastActive: Date.now(),
    pendingOperations: [],
  }
  state.pendingOperations.push({ type, todoId, data })
  saveRecoveryState(state)
}

/**
 * Get and clear pending operations
 */
export function getPendingOperations(): RecoveryState['pendingOperations'] {
  const state = loadRecoveryState()
  if (!state) return []

  const operations = state.pendingOperations
  state.pendingOperations = []
  saveRecoveryState(state)

  return operations
}

/**
 * Initialize crash recovery system
 */
export async function initializeCrashRecovery(): Promise<{
  hasCrashed: boolean
  pendingOperations: RecoveryState['pendingOperations']
}> {
  const hasCrashed = detectCrash()
  const pendingOperations = hasCrashed ? getPendingOperations() : []

  // Start heartbeat
  startHeartbeat()

  // Register service worker
  await registerServiceWorker()

  return { hasCrashed, pendingOperations }
}
