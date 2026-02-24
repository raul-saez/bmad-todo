'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createSyncManager } from '@/services/sync/syncManager'
import { SyncMessageSchema } from '@/services/sync/messageSchema'
import type { SyncMessage } from '@/services/sync/broadcastSync'

export type SyncStatus = 'syncing' | 'synced' | 'error'

export interface SyncContextValue {
  syncStatus: SyncStatus
  lastSyncTime: Date | null
  syncError: string | null
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined)

export interface SyncProviderProps {
  children: ReactNode
  source?: string
  channelName?: string
  onSyncMessage?: (message: SyncMessage) => void | Promise<void>
}

const createSourceId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const SyncProvider = ({
  children,
  source,
  channelName,
  onSyncMessage,
}: SyncProviderProps) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced')
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  const sourceId = useMemo(() => source ?? createSourceId(), [source])

  useEffect(() => {
    let isActive = true

    const manager = createSyncManager({
      source: sourceId,
      channelName,
      onMessage: async (message) => {
        setSyncStatus('syncing')
        setSyncError(null)

        try {
          const parsed = SyncMessageSchema.parse(message)
          await onSyncMessage?.(parsed)

          if (!isActive) {
            return
          }

          setSyncStatus('synced')
          setLastSyncTime(new Date(parsed.timestamp))
        } catch (error) {
          if (!isActive) {
            return
          }

          setSyncStatus('error')
          setSyncError(
            error instanceof Error ? error.message : 'Unknown sync error',
          )
        }
      },
    })

    return () => {
      isActive = false
      manager.close()
    }
  }, [channelName, onSyncMessage, sourceId])

  const value = useMemo(
    () => ({ syncStatus, lastSyncTime, syncError }),
    [syncStatus, lastSyncTime, syncError],
  )

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>
}

export const useSyncContext = (): SyncContextValue => {
  const context = useContext(SyncContext)

  if (!context) {
    throw new Error('useSyncContext must be used within SyncProvider')
  }

  return context
}
