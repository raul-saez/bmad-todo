import { Todo } from '@/lib/schemas'

const toTimestamp = (value: Date | string): number =>
  value instanceof Date ? value.getTime() : new Date(value).getTime()

export const resolveConflict = (local: Todo, remote: Todo): Todo => {
  const localTime = toTimestamp(local.updatedAt)
  const remoteTime = toTimestamp(remote.updatedAt)

  if (remoteTime > localTime) {
    return remote
  }

  if (localTime > remoteTime) {
    return local
  }

  return remote
}
