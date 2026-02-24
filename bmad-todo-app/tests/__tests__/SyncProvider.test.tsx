import { act, render, screen } from '@testing-library/react'
import {
  SyncProvider,
  useSyncContext,
} from '@/components/providers/SyncProvider'
import { createSyncManager } from '@/services/sync/syncManager'
import type { SyncMessage } from '@/services/sync/broadcastSync'

jest.mock('@/services/sync/syncManager', () => ({
  createSyncManager: jest.fn(),
}))

const TestConsumer = () => {
  const { syncStatus, lastSyncTime, syncError } = useSyncContext()

  return (
    <div>
      <div data-testid="status">{syncStatus}</div>
      <div data-testid="last-sync">
        {lastSyncTime ? lastSyncTime.toISOString() : 'none'}
      </div>
      <div data-testid="error">{syncError ?? 'none'}</div>
    </div>
  )
}

describe('SyncProvider', () => {
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

  it('provides sync context defaults', () => {
    setupManagerMock()

    render(
      <SyncProvider source="tab-a">
        <TestConsumer />
      </SyncProvider>,
    )

    expect(screen.getByTestId('status')).toHaveTextContent('synced')
    expect(screen.getByTestId('last-sync')).toHaveTextContent('none')
    expect(screen.getByTestId('error')).toHaveTextContent('none')
  })

  it('updates status while processing and after completion', async () => {
    setupManagerMock()

    let resolvePromise: (() => void) | null = null
    const processingPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve
    })

    render(
      <SyncProvider source="tab-a" onSyncMessage={() => processingPromise}>
        <TestConsumer />
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

    expect(screen.getByTestId('status')).toHaveTextContent('syncing')

    await act(async () => {
      resolvePromise?.()
      await processingPromise
    })

    expect(screen.getByTestId('status')).toHaveTextContent('synced')
    expect(screen.getByTestId('last-sync')).toHaveTextContent(
      new Date(123).toISOString(),
    )
  })

  it('updates error state when processing fails', async () => {
    setupManagerMock()

    render(
      <SyncProvider
        source="tab-a"
        onSyncMessage={() => {
          throw new Error('Sync failed')
        }}
      >
        <TestConsumer />
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

    expect(screen.getByTestId('status')).toHaveTextContent('error')
    expect(screen.getByTestId('error')).toHaveTextContent('Sync failed')
  })

  it('throws when used outside provider', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    expect(() => render(<TestConsumer />)).toThrow(
      'useSyncContext must be used within SyncProvider',
    )

    consoleError.mockRestore()
  })
})
