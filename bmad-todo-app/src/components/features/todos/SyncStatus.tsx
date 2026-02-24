'use client'

import { useSyncContext } from '@/components/providers/SyncProvider'

export interface SyncStatusProps {
  onRetry?: () => void
}

const statusStyles = {
  syncing: {
    label: 'Syncing…',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  synced: {
    label: 'Synced',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  error: {
    label: 'Sync error',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
}

export const SyncStatus = ({ onRetry }: SyncStatusProps) => {
  const { syncStatus, lastSyncTime, syncError } = useSyncContext()
  const styles = statusStyles[syncStatus]

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2 text-sm ${styles.className}`}
    >
      <span className="font-semibold">{styles.label}</span>
      {syncStatus === 'synced' && lastSyncTime ? (
        <span className="text-xs text-emerald-700/80">
          Last synced {lastSyncTime.toLocaleTimeString()}
        </span>
      ) : null}
      {syncStatus === 'error' && syncError ? (
        <span className="text-xs text-rose-700/80">{syncError}</span>
      ) : null}
      {syncStatus === 'error' && onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="ml-auto rounded-md border border-rose-200 bg-white px-2 py-1 text-xs font-medium text-rose-700 shadow-sm transition hover:bg-rose-50"
        >
          Retry
        </button>
      ) : null}
    </div>
  )
}
