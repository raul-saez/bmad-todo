export type SyncAction = 'created' | 'updated' | 'deleted' | 'sync-request'

export interface SyncMessage<T = unknown> {
  resource: 'todo'
  action: SyncAction
  data: T
  timestamp: number
  source: string
}

export const DEFAULT_CHANNEL = 'bmad-todos'

export const isBroadcastSupported = (): boolean =>
  typeof BroadcastChannel !== 'undefined'

export const createChannel = (
  name: string = DEFAULT_CHANNEL,
): BroadcastChannel | null => {
  if (!isBroadcastSupported()) {
    console.warn('BroadcastChannel not supported; fallback required.')
    return null
  }

  return new BroadcastChannel(name)
}

export const send = (
  channel: BroadcastChannel | null,
  message: SyncMessage,
): void => {
  if (!channel) {
    return
  }

  channel.postMessage(message)
}

export const listen = (
  channel: BroadcastChannel | null,
  handler: (message: SyncMessage) => void,
): (() => void) => {
  if (!channel) {
    return () => {}
  }

  const listener = (event: MessageEvent) => {
    handler(event.data as SyncMessage)
  }

  if ('addEventListener' in channel) {
    channel.addEventListener('message', listener)
    return () => channel.removeEventListener('message', listener)
  }

  channel.onmessage = listener
  return () => {
    if (channel.onmessage === listener) {
      channel.onmessage = null
    }
  }
}

export const close = (channel: BroadcastChannel | null): void => {
  channel?.close()
}
