import { useTodoForm, useTodos } from '@/hooks'

describe('hooks barrel exports', () => {
  it('exports useTodos and useTodoForm', () => {
    expect(useTodos).toBeDefined()
    expect(useTodoForm).toBeDefined()
  })
})
