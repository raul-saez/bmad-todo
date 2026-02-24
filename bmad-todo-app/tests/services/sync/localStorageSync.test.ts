import {
  clearQueue,
  listen,
  send,
  syncConfig,
} from '@/services/sync/localStorageSync'
import { SyncMessage } from '@/services/sync/broadcastSync'

describe('localStorageSync service', () => {
  const baseMessage: SyncMessage = {
    resource: 'todo',
    action: 'created',
    data: { id: '1', title: 'Test' },
    timestamp: Date.now(),
    source: 'tab-a',
  }

  beforeEach(() => {
    jest.useFakeTimers()
    localStorage.clear()
    clearQueue()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('sends messages to localStorage queue', () => {
    const entry = send(baseMessage, 'tab-a')
    const raw = localStorage.getItem(syncConfig.SYNC_KEY)

    expect(raw).toContain(entry.id)
    expect(raw).toContain('tab-a')
  })

  it('delivers messages to other tabs and clears queue', () => {
    const handler = jest.fn()
    const stop = listen(handler, { source: 'tab-b', interval: 100 })

    send(baseMessage, 'tab-a')

    jest.advanceTimersByTime(100)

    expect(handler).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem(syncConfig.SYNC_KEY)).toBe('[]')

    stop()
  })

  it('ignores self-sent messages', () => {
    const handler = jest.fn()
    const stop = listen(handler, { source: 'tab-a', interval: 100 })

    send(baseMessage, 'tab-a')

    jest.advanceTimersByTime(100)

    expect(handler).not.toHaveBeenCalled()

    stop()
  })
})
