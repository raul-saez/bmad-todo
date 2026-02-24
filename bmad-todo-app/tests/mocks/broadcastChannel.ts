export class MockBroadcastChannel {
  name: string
  onmessage: ((event: MessageEvent) => void) | null = null
  private static channels: Map<string, MockBroadcastChannel[]> = new Map()

  constructor(name: string) {
    this.name = name
    if (!MockBroadcastChannel.channels.has(name)) {
      MockBroadcastChannel.channels.set(name, [])
    }
    MockBroadcastChannel.channels.get(name)!.push(this)
  }

  postMessage(message: any) {
    const channels = MockBroadcastChannel.channels.get(this.name) || []
    channels.forEach((channel) => {
      if (channel !== this && channel.onmessage) {
        channel.onmessage(new MessageEvent('message', { data: message }))
      }
    })
  }

  close() {
    const channels = MockBroadcastChannel.channels.get(this.name) || []
    const index = channels.indexOf(this)
    if (index > -1) {
      channels.splice(index, 1)
    }
  }

  static reset() {
    this.channels.clear()
  }
}
