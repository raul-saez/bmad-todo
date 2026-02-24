import { prisma } from '@/lib/prisma'
import { CreateTodoSchema, UpdateTodoSchema } from '@/lib/schemas'

describe('Database - Todo CRUD Operations', () => {
  beforeEach(async () => {
    await prisma.todo.deleteMany({})
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('creates and retrieves a todo', async () => {
    const created = await prisma.todo.create({ data: { title: 'Test' } })
    const found = await prisma.todo.findUnique({ where: { id: created.id } })
    expect(found?.title).toBe('Test')
  })

  it('lists all todos', async () => {
    await prisma.todo.create({ data: { title: 'Todo 1' } })
    await prisma.todo.create({ data: { title: 'Todo 2' } })
    const todos = await prisma.todo.findMany()
    expect(todos).toHaveLength(2)
  })

  it('updates todo', async () => {
    const todo = await prisma.todo.create({ data: { title: 'Original' } })
    const updated = await prisma.todo.update({
      where: { id: todo.id },
      data: { title: 'Updated', completed: true },
    })
    expect(updated.title).toBe('Updated')
    expect(updated.completed).toBe(true)
  })

  it('deletes todo', async () => {
    const todo = await prisma.todo.create({ data: { title: 'Delete me' } })
    await prisma.todo.delete({ where: { id: todo.id } })
    const found = await prisma.todo.findUnique({ where: { id: todo.id } })
    expect(found).toBeNull()
  })

  it('validates input with schemas', () => {
    expect(() => CreateTodoSchema.parse({ title: '' })).toThrow()
    expect(() => CreateTodoSchema.parse({ title: 'a'.repeat(501) })).toThrow()
    expect(() => UpdateTodoSchema.parse({ title: '' })).toThrow()
  })

  it('completes full CRUD workflow', async () => {
    // CREATE
    const todo = await prisma.todo.create({ data: { title: 'Buy milk' } })

    // READ
    let found = await prisma.todo.findUnique({ where: { id: todo.id } })
    expect(found?.title).toBe('Buy milk')

    // UPDATE
    found = await prisma.todo.update({
      where: { id: todo.id },
      data: { completed: true },
    })
    expect(found.completed).toBe(true)

    // DELETE
    await prisma.todo.delete({ where: { id: todo.id } })
    const deleted = await prisma.todo.findUnique({ where: { id: todo.id } })
    expect(deleted).toBeNull()
  })
})
