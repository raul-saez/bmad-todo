import { SyncMessageSchema } from '@/services/sync/messageSchema'

describe('SyncMessageSchema', () => {
  it('accepts valid sync messages', () => {
    const result = SyncMessageSchema.safeParse({
      resource: 'todo',
      action: 'created',
      data: { id: '1' },
      timestamp: Date.now(),
      source: 'tab-a',
    })

    expect(result.success).toBe(true)
  })

  it('rejects invalid sync messages', () => {
    const result = SyncMessageSchema.safeParse({
      resource: 'note',
      action: 'created',
      data: { id: '1' },
      timestamp: 'now',
      source: '',
    })

    expect(result.success).toBe(false)
  })
})
