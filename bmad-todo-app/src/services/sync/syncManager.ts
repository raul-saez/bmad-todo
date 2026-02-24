import {
  createChannel,
  isBroadcastSupported,
  listen as listenBroadcast,
  send as sendBroadcast,
  close as closeBroadcast,
  SyncMessage,
} from './broadcastSync'
import { listen as listenLocal, send as sendLocal } from './localStorageSync'

export interface SyncManagerOptions {
  source: string
  channelName?: string
  onMessage: (message: SyncMessage) => void
}

export const createSyncManager = (options: SyncManagerOptions) => {
  const { source, channelName, onMessage } = options
  let unsubscribe: () => void = () => {}
  let channel: BroadcastChannel | null = null
  const useBroadcast = isBroadcastSupported()

  if (useBroadcast) {
    channel = createChannel(channelName)
    unsubscribe = listenBroadcast(channel, onMessage)
  } else {
    unsubscribe = listenLocal(onMessage, { source })
  }

  const send = (message: SyncMessage) => {
    if (useBroadcast) {
      sendBroadcast(channel, message)
    } else {
      sendLocal(message, source)
    }
  }

  const close = () => {
    unsubscribe()
    if (useBroadcast) {
      closeBroadcast(channel)
    }
  }

  return {
    send,
    close,
    channel,
    using: useBroadcast ? 'broadcast' : 'localStorage',
  }
}
