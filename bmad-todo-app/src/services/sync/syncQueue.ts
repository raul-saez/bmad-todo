import type { SyncMessage } from './broadcastSync'

const MAX_QUEUE_SIZE = 100

const queue: SyncMessage[] = []

const warnOverflow = (dropped: number) => {
  console.warn(
    `Sync queue overflow: dropped ${dropped} oldest operation${
      dropped === 1 ? '' : 's'
    }`,
  )
}

export const enqueue = (message: SyncMessage): SyncMessage => {
  const entry: SyncMessage = {
    ...message,
    timestamp: message.timestamp ?? Date.now(),
  }

  if (queue.length >= MAX_QUEUE_SIZE) {
    const overflowCount = queue.length - MAX_QUEUE_SIZE + 1
    queue.splice(0, overflowCount)
    warnOverflow(overflowCount)
  }

  queue.push(entry)
  return entry
}

export const dequeue = (): SyncMessage | undefined => queue.shift()

export const isPending = (): boolean => queue.length > 0

export const flush = async (
  handler: (message: SyncMessage) => void | Promise<void>,
): Promise<SyncMessage[]> => {
  const items = queue.splice(0, queue.length)
  const flushed: SyncMessage[] = []

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index]

    try {
      await handler(item)
      flushed.push(item)
    } catch (error) {
      queue.push(...items.slice(index))
      console.warn('Sync queue flush failed, retrying later', error)
      break
    }
  }

  return flushed
}

export const clearQueue = () => {
  queue.splice(0, queue.length)
}

export const queueConfig = {
  MAX_QUEUE_SIZE,
}
