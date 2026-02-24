/** @jest-environment node */

import { NextRequest } from 'next/server'
import { GET, PATCH, DELETE } from '@/app/api/todos/[id]/route'
import { prisma } from '@/lib/prisma'
import { resetDatabase } from '../helpers/db'

describe('/api/todos/[id] route', () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  it('returns a todo by id', async () => {
    const created = await prisma.todo.create({
      data: { title: 'Find me' },
    })

    const request = new NextRequest(`http://localhost/api/todos/${created.id}`)
    const response = await GET(request, { params: { id: created.id } })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.id).toBe(created.id)
  })

  it('returns 404 when todo is not found', async () => {
    const request = new NextRequest('http://localhost/api/todos/missing')
    const response = await GET(request, { params: { id: 'missing' } })

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.error).toBe('Todo not found')
  })

  it('updates a todo with valid input', async () => {
    const created = await prisma.todo.create({
      data: { title: 'Update me', completed: false },
    })

    const request = new NextRequest(
      `http://localhost/api/todos/${created.id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      },
    )

    const response = await PATCH(request, { params: { id: created.id } })
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.completed).toBe(true)
  })

  it('returns validation errors for invalid updates', async () => {
    const created = await prisma.todo.create({
      data: { title: 'Invalid update', completed: false },
    })

    const request = new NextRequest(
      `http://localhost/api/todos/${created.id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: 'nope' }),
      },
    )

    const response = await PATCH(request, { params: { id: created.id } })
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe('Validation failed')
  })

  it('deletes a todo by id', async () => {
    const created = await prisma.todo.create({
      data: { title: 'Delete me' },
    })

    const request = new NextRequest(
      `http://localhost/api/todos/${created.id}`,
      {
        method: 'DELETE',
      },
    )

    const response = await DELETE(request, { params: { id: created.id } })
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)

    const exists = await prisma.todo.findUnique({
      where: { id: created.id },
    })
    expect(exists).toBeNull()
  })

  it('returns 404 when deleting a missing todo', async () => {
    const request = new NextRequest('http://localhost/api/todos/missing', {
      method: 'DELETE',
    })

    const response = await DELETE(request, { params: { id: 'missing' } })
    expect(response.status).toBe(404)

    const data = await response.json()
    expect(data.error).toBe('Todo not found')
  })
})
