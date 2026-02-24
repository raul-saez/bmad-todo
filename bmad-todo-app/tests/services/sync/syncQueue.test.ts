import {
  clearQueue,
  dequeue,
  enqueue,
  flush,
  isPending,
  queueConfig,
} from '@/services/sync/syncQueue'
import type { SyncMessage } from '@/services/sync/broadcastSync'

describe('syncQueue', () => {
  const createMessage = (timestamp: number): SyncMessage => ({
    resource: 'todo',
    action: 'created',
    data: { id: `todo-${timestamp}` },
    timestamp,
    source: 'tab-a',
  })

  beforeEach(() => {
    clearQueue()
    jest.clearAllMocks()
  })

  it('enqueues and dequeues in order', () => {
    const first = enqueue(createMessage(1))
    const second = enqueue(createMessage(2))

    expect(dequeue()).toEqual(first)
    expect(dequeue()).toEqual(second)
    expect(dequeue()).toBeUndefined()
  })

  it('reports pending status correctly', () => {
    expect(isPending()).toBe(false)

    enqueue(createMessage(1))
    expect(isPending()).toBe(true)

    dequeue()
    expect(isPending()).toBe(false)
  })

  it('flushes queued operations in order', async () => {
    const timestamps = [1, 2, 3]
    timestamps.forEach((timestamp) => enqueue(createMessage(timestamp)))

    const handled: number[] = []

    await flush((message) => {
      handled.push(message.timestamp)
    })

    expect(handled).toEqual(timestamps)
    expect(isPending()).toBe(false)
  })

  it('drops oldest operations when queue overflows', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    for (let index = 1; index <= queueConfig.MAX_QUEUE_SIZE + 1; index += 1) {
      enqueue(createMessage(index))
    }

    const firstRemaining = dequeue()
    expect(firstRemaining?.timestamp).toBe(2)
    expect(warnSpy).toHaveBeenCalled()

    warnSpy.mockRestore()
  })
})
