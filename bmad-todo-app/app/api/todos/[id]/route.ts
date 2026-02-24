import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { UpdateTodoSchema } from '@/lib/schemas'
import { ZodError } from 'zod'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const todo = await prisma.todo.findUnique({
      where: { id },
    })

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    return NextResponse.json(todo)
  } catch (error) {
    console.error('GET /api/todos/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch todo' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const validated = UpdateTodoSchema.parse(body)

    const todo = await prisma.todo.findUnique({
      where: { id },
    })

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    const updated = await prisma.todo.update({
      where: { id },
      data: validated,
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 },
      )
    }
    console.error('PATCH /api/todos/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const todo = await prisma.todo.findUnique({
      where: { id },
    })

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    await prisma.todo.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/todos/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 },
    )
  }
}
