import { prisma } from '@/lib/prisma'

export async function resetDatabase() {
  try {
    await prisma.todo.deleteMany({})
  } catch (error) {
    console.error('Failed to reset database:', error)
  }
}

export async function seedDatabase() {
  const todos = [
    { title: 'Learn Next.js', completed: true },
    { title: 'Build todo app', completed: false },
    { title: 'Deploy to production', completed: false },
  ]

  for (const todo of todos) {
    await prisma.todo.create({ data: todo })
  }
}
