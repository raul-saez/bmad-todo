import {
  close,
  createChannel,
  listen,
  send,
  SyncMessage,
} from '@/services/sync/broadcastSync'

describe('broadcastSync service', () => {
  const message: SyncMessage = {
    resource: 'todo',
    action: 'created',
    data: { id: '1', title: 'Test' },
    timestamp: Date.now(),
    source: 'tab-a',
  }

  it('creates a channel and sends messages', () => {
    const channel = createChannel('test-channel')
    expect(channel).not.toBeNull()

    const spy = jest.spyOn(channel as BroadcastChannel, 'postMessage')
    send(channel, message)

    expect(spy).toHaveBeenCalledWith(message)
    close(channel)
  })

  it('listens for messages and cleans up', () => {
    const channel = createChannel('test-channel')
    const sender = createChannel('test-channel')
    const handler = jest.fn()

    const unsubscribe = listen(channel, handler)

    ;(sender as BroadcastChannel).postMessage(message)

    expect(handler).toHaveBeenCalledWith(message)

    unsubscribe()
    close(channel)
    close(sender)
  })
})
