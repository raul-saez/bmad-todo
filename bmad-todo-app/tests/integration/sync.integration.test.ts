import { SyncMessageSchema } from '@/services/sync/messageSchema'
import { resolveConflict } from '@/services/sync/conflictResolver'
import {
  clearQueue as clearLocalSyncQueue,
  listen,
  send,
} from '@/services/sync/localStorageSync'
import {
  clearQueue as clearSyncQueue,
  enqueue,
  flush,
  isPending,
} from '@/services/sync/syncQueue'
import type { SyncMessage } from '@/services/sync/broadcastSync'
import type { Todo } from '@/lib/schemas'

describe('sync integration', () => {
  const createMessage = (timestamp: number, title = 'Todo'): SyncMessage => ({
    resource: 'todo',
    action: 'updated',
    data: {
      id: `todo-${timestamp}`,
      title,
      completed: false,
      createdAt: new Date(timestamp),
      updatedAt: new Date(timestamp),
    },
    timestamp,
    source: 'tab-a',
  })

  beforeEach(() => {
    clearLocalSyncQueue()
    clearSyncQueue()
    jest.clearAllMocks()
  })

  it('syncs messages across tabs via localStorage fallback', () => {
    jest.useFakeTimers()

    const received: SyncMessage[] = []
    const unsubscribe = listen(
      (message) => {
        const parsed = SyncMessageSchema.parse(message)
        received.push(parsed)
      },
      { source: 'tab-b', interval: 5 },
    )

    const message = createMessage(100)
    send(message, 'tab-a')

    jest.advanceTimersByTime(10)

    expect(received).toHaveLength(1)
    expect(received[0]).toMatchObject({
      resource: 'todo',
      action: 'updated',
      timestamp: 100,
      source: 'tab-a',
    })

    unsubscribe()
    jest.useRealTimers()
  })

  it('resolves conflicts using last-write-wins', () => {
    const local: Todo = {
      id: 'todo-1',
      title: 'Local',
      completed: false,
      createdAt: new Date(100),
      updatedAt: new Date(100),
    }

    const remote: Todo = {
      id: 'todo-1',
      title: 'Remote',
      completed: true,
      createdAt: new Date(100),
      updatedAt: new Date(200),
    }

    const message: SyncMessage = {
      resource: 'todo',
      action: 'updated',
      data: remote,
      timestamp: remote.updatedAt.getTime(),
      source: 'tab-b',
    }
    const parsed = SyncMessageSchema.parse(message)
    const resolved = resolveConflict(local, parsed.data as Todo)

    expect(resolved.title).toBe(remote.title)
    expect(resolved.completed).toBe(true)
  })

  it('flushes queued operations in order after offline period', async () => {
    const timestamps = [1, 2, 3, 4, 5]
    timestamps.forEach((timestamp) => enqueue(createMessage(timestamp)))

    const handled: number[] = []
    const flushed = await flush((message) => {
      handled.push(message.timestamp)
    })

    expect(handled).toEqual(timestamps)
    expect(flushed).toHaveLength(timestamps.length)
    expect(isPending()).toBe(false)
  })
})
