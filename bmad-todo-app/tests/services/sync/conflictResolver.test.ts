import { resolveConflict } from '@/services/sync/conflictResolver'
import { todoFactory } from '@/__tests__/fixtures/todos.fixtures'

describe('conflictResolver', () => {
  it('returns remote when remote is newer', () => {
    const local = todoFactory({
      updatedAt: new Date('2026-02-24T10:00:00Z'),
    })
    const remote = todoFactory({
      updatedAt: new Date('2026-02-24T12:00:00Z'),
    })

    expect(resolveConflict(local, remote)).toEqual(remote)
  })

  it('returns local when local is newer', () => {
    const local = todoFactory({
      updatedAt: new Date('2026-02-24T12:00:00Z'),
    })
    const remote = todoFactory({
      updatedAt: new Date('2026-02-24T10:00:00Z'),
    })

    expect(resolveConflict(local, remote)).toEqual(local)
  })

  it('returns remote on tie', () => {
    const local = todoFactory({
      updatedAt: new Date('2026-02-24T12:00:00Z'),
    })
    const remote = todoFactory({
      updatedAt: new Date('2026-02-24T12:00:00Z'),
    })

    expect(resolveConflict(local, remote)).toEqual(remote)
  })
})
