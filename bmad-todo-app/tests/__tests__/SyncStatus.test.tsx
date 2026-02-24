import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SyncProvider } from '@/components/providers/SyncProvider'
import { SyncStatus } from '@/components/features/todos/SyncStatus'
import { createSyncManager } from '@/services/sync/syncManager'
import type { SyncMessage } from '@/services/sync/broadcastSync'

jest.mock('@/services/sync/syncManager', () => ({
  createSyncManager: jest.fn(),
}))

describe('SyncStatus', () => {
  const createSyncManagerMock = createSyncManager as jest.MockedFunction<
    typeof createSyncManager
  >
  let onMessageHandler:
    | ((message: SyncMessage) => void | Promise<void>)
    | null = null

  const setupManagerMock = () => {
    createSyncManagerMock.mockImplementation((options) => {
      onMessageHandler = options.onMessage
      return {
        send: jest.fn(),
        close: jest.fn(),
        channel: null,
        using: 'broadcast',
      }
    })
  }

  beforeEach(() => {
    onMessageHandler = null
    jest.clearAllMocks()
  })

  it('renders synced status by default', () => {
    setupManagerMock()

    render(
      <SyncProvider source="tab-a">
        <SyncStatus />
      </SyncProvider>,
    )

    expect(screen.getByText(/synced/i)).toBeInTheDocument()
  })

  it('renders syncing status while processing', async () => {
    setupManagerMock()

    let resolvePromise: (() => void) | null = null
    const processingPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve
    })

    render(
      <SyncProvider source="tab-a" onSyncMessage={() => processingPromise}>
        <SyncStatus />
      </SyncProvider>,
    )

    const message: SyncMessage = {
      resource: 'todo',
      action: 'created',
      data: { id: '1' },
      timestamp: 123,
      source: 'tab-b',
    }

    act(() => {
      void onMessageHandler?.(message)
    })

    expect(screen.getByText(/syncing/i)).toBeInTheDocument()

    await act(async () => {
      resolvePromise?.()
      await processingPromise
    })
  })

  it('renders error state and retry action', async () => {
    setupManagerMock()

    const onRetry = jest.fn()

    render(
      <SyncProvider
        source="tab-a"
        onSyncMessage={() => {
          throw new Error('Sync failed')
        }}
      >
        <SyncStatus onRetry={onRetry} />
      </SyncProvider>,
    )

    const message: SyncMessage = {
      resource: 'todo',
      action: 'updated',
      data: { id: '1' },
      timestamp: 456,
      source: 'tab-b',
    }

    await act(async () => {
      await onMessageHandler?.(message)
    })

    expect(screen.getByText(/sync error/i)).toBeInTheDocument()
    expect(screen.getByText(/sync failed/i)).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /retry/i }))

    expect(onRetry).toHaveBeenCalled()
  })
})
