import '@testing-library/jest-dom'
import 'jest-axe/extend-expect'
import { structuredClone as nodeStructuredClone } from 'node:util'

// Mock Broadcast Channel API with cross-instance communication
class MockBroadcastChannel {
  name: string
  static instances: Map<string, MockBroadcastChannel[]> = new Map()

  constructor(name: string) {
    this.name = name
    if (!MockBroadcastChannel.instances.has(name)) {
      MockBroadcastChannel.instances.set(name, [])
    }
    MockBroadcastChannel.instances.get(name)?.push(this)
  }

  postMessage(message: unknown) {
    const channels = MockBroadcastChannel.instances.get(this.name) || []
    channels.forEach((channel) => {
      if (channel !== this) {
        const event = new MessageEvent('message', { data: message })
        channel.onmessage?.(event as MessageEvent)
      }
    })
  }

  onmessage: ((event: MessageEvent) => void) | null = null

  close() {
    const channels = MockBroadcastChannel.instances.get(this.name) || []
    const index = channels.indexOf(this)
    if (index > -1) {
      channels.splice(index, 1)
    }
  }
}

global.BroadcastChannel = MockBroadcastChannel as any

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone =
    nodeStructuredClone as unknown as typeof structuredClone
}

// Mock fetch globally
Object.defineProperty(global, 'fetch', {
  writable: true,
  value: jest.fn(),
})
