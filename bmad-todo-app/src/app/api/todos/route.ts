import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateTodoSchema, UpdateTodoSchema } from '@/lib/schemas'
import { ZodError } from 'zod'

export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(todos)
  } catch (error) {
    console.error('GET /api/todos error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = CreateTodoSchema.parse(body)

    const todo = await prisma.todo.create({
      data: {
        title: validated.title,
      },
    })

    return NextResponse.json(todo, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 },
      )
    }
    console.error('POST /api/todos error:', error)
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 },
    )
  }
}
