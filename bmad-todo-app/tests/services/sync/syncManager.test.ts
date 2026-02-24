jest.mock('@/services/sync/broadcastSync', () => ({
  isBroadcastSupported: jest.fn(),
  createChannel: jest.fn(),
  listen: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
}))

jest.mock('@/services/sync/localStorageSync', () => ({
  listen: jest.fn(),
  send: jest.fn(),
}))

import { createSyncManager } from '@/services/sync/syncManager'
import { SyncMessage } from '@/services/sync/broadcastSync'
import * as broadcast from '@/services/sync/broadcastSync'
import * as localStorageSync from '@/services/sync/localStorageSync'

describe('syncManager', () => {
  const message: SyncMessage = {
    resource: 'todo',
    action: 'created',
    data: { id: '1' },
    timestamp: Date.now(),
    source: 'tab-a',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uses BroadcastChannel when supported', () => {
    const channel = { postMessage: jest.fn(), close: jest.fn() }
    broadcast.isBroadcastSupported.mockReturnValue(true)
    broadcast.createChannel.mockReturnValue(channel)
    broadcast.listen.mockReturnValue(jest.fn())

    const manager = createSyncManager({
      source: 'tab-a',
      onMessage: jest.fn(),
    })

    manager.send(message)

    expect(manager.using).toBe('broadcast')
    expect(broadcast.send).toHaveBeenCalledWith(channel, message)
  })

  it('falls back to localStorage when BroadcastChannel is unavailable', () => {
    broadcast.isBroadcastSupported.mockReturnValue(false)
    localStorageSync.listen.mockReturnValue(jest.fn())

    const manager = createSyncManager({
      source: 'tab-a',
      onMessage: jest.fn(),
    })

    manager.send(message)

    expect(manager.using).toBe('localStorage')
    expect(localStorageSync.send).toHaveBeenCalledWith(message, 'tab-a')
  })
})
