import { SyncMessage } from './broadcastSync'

export interface LocalSyncOptions {
  source: string
  interval?: number
}

export interface LocalSyncMessage extends SyncMessage {
  id: string
}

const SYNC_KEY = 'bmad-todos-sync'
const DEFAULT_INTERVAL = 100

const readQueue = (): LocalSyncMessage[] => {
  try {
    const raw = localStorage.getItem(SYNC_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as LocalSyncMessage[]
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn('localStorage sync data corrupted, resetting', error)
    localStorage.removeItem(SYNC_KEY)
    return []
  }
}

const writeQueue = (queue: LocalSyncMessage[]) => {
  localStorage.setItem(SYNC_KEY, JSON.stringify(queue))
}

export const send = (
  message: SyncMessage,
  source: string,
): LocalSyncMessage => {
  const entry: LocalSyncMessage = {
    ...message,
    source,
    id: `${source}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  }

  const queue = readQueue()
  queue.push(entry)
  writeQueue(queue)
  return entry
}

export const listen = (
  handler: (message: LocalSyncMessage) => void,
  options: LocalSyncOptions,
): (() => void) => {
  const { source, interval = DEFAULT_INTERVAL } = options
  const processed = new Set<string>()

  const poll = () => {
    const queue = readQueue()
    if (queue.length === 0) {
      return
    }

    const remaining: LocalSyncMessage[] = []

    for (const entry of queue) {
      if (processed.has(entry.id)) {
        continue
      }

      if (entry.source === source) {
        remaining.push(entry)
        continue
      }

      processed.add(entry.id)
      handler(entry)
    }

    writeQueue(remaining)
  }

  const timer = window.setInterval(poll, interval)

  return () => {
    window.clearInterval(timer)
  }
}

export const clearQueue = () => {
  localStorage.removeItem(SYNC_KEY)
}

export const syncConfig = {
  SYNC_KEY,
  DEFAULT_INTERVAL,
}
