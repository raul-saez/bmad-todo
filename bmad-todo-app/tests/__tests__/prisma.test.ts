import { prisma } from '@/lib/prisma'

describe('Prisma Todo Model', () => {
  beforeEach(async () => {
    // Clear todos before each test
    await prisma.todo.deleteMany({})
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('Create', () => {
    it('creates a new todo with valid data', async () => {
      const todo = await prisma.todo.create({
        data: { title: 'New todo' },
      })

      expect(todo).toHaveProperty('id')
      expect(todo.title).toBe('New todo')
      expect(todo.completed).toBe(false)
      expect(todo).toHaveProperty('createdAt')
      expect(todo).toHaveProperty('updatedAt')
    })

    it('creates multiple todos', async () => {
      await prisma.todo.create({ data: { title: 'Todo 1' } })
      await prisma.todo.create({ data: { title: 'Todo 2' } })

      const todos = await prisma.todo.findMany()
      expect(todos).toHaveLength(2)
    })
  })

  describe('Read', () => {
    it('returns empty array when no todos exist', async () => {
      const todos = await prisma.todo.findMany()
      expect(Array.isArray(todos)).toBe(true)
      expect(todos).toHaveLength(0)
    })

    it('returns all todos ordered by createdAt desc', async () => {
      await prisma.todo.create({ data: { title: 'First' } })
      await new Promise((resolve) => setTimeout(resolve, 10))
      await prisma.todo.create({ data: { title: 'Second' } })

      const todos = await prisma.todo.findMany({
        orderBy: { createdAt: 'desc' },
      })

      expect(todos).toHaveLength(2)
      expect(todos[0].title).toBe('Second')
      expect(todos[1].title).toBe('First')
    })

    it('returns a specific todo by id', async () => {
      const created = await prisma.todo.create({
        data: { title: 'Test todo' },
      })

      const todo = await prisma.todo.findUnique({
        where: { id: created.id },
      })

      expect(todo).not.toBeNull()
      expect(todo?.id).toBe(created.id)
      expect(todo?.title).toBe('Test todo')
    })

    it('returns null for non-existent todo', async () => {
      const todo = await prisma.todo.findUnique({
        where: { id: 'nonexistent123' },
      })

      expect(todo).toBeNull()
    })
  })

  describe('Update', () => {
    it('updates todo title', async () => {
      const created = await prisma.todo.create({
        data: { title: 'Original' },
      })

      const updated = await prisma.todo.update({
        where: { id: created.id },
        data: { title: 'Updated' },
      })

      expect(updated.title).toBe('Updated')
      expect(updated.id).toBe(created.id)
    })

    it('updates todo completed status', async () => {
      const created = await prisma.todo.create({
        data: { title: 'Test', completed: false },
      })

      const updated = await prisma.todo.update({
        where: { id: created.id },
        data: { completed: true },
      })

      expect(updated.completed).toBe(true)
    })

    it('updates both title and completed', async () => {
      const created = await prisma.todo.create({
        data: { title: 'Original', completed: false },
      })

      const updated = await prisma.todo.update({
        where: { id: created.id },
        data: { title: 'Updated', completed: true },
      })

      expect(updated.title).toBe('Updated')
      expect(updated.completed).toBe(true)
    })

    it('throws error for non-existent todo', async () => {
      await expect(
        prisma.todo.update({
          where: { id: 'nonexistent123' },
          data: { completed: true },
        }),
      ).rejects.toThrow()
    })
  })

  describe('Delete', () => {
    it('deletes a todo', async () => {
      const created = await prisma.todo.create({
        data: { title: 'To delete' },
      })

      await prisma.todo.delete({
        where: { id: created.id },
      })

      const todo = await prisma.todo.findUnique({
        where: { id: created.id },
      })

      expect(todo).toBeNull()
    })

    it('throws error for non-existent todo', async () => {
      await expect(
        prisma.todo.delete({
          where: { id: 'nonexistent123' },
        }),
      ).rejects.toThrow()
    })

    it('can create and delete multiple todos', async () => {
      const todo1 = await prisma.todo.create({ data: { title: 'Todo 1' } })
      const todo2 = await prisma.todo.create({ data: { title: 'Todo 2' } })

      await prisma.todo.delete({ where: { id: todo1.id } })

      const todos = await prisma.todo.findMany()
      expect(todos).toHaveLength(1)
      expect(todos[0].id).toBe(todo2.id)
    })
  })
})
