/** @jest-environment node */

import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/todos/route'
import { prisma } from '@/lib/prisma'
import { resetDatabase } from '../helpers/db'

describe('/api/todos route', () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  it('returns todos ordered by newest first', async () => {
    await prisma.todo.create({ data: { title: 'First todo' } })
    await prisma.todo.create({ data: { title: 'Second todo' } })

    const response = await GET()
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveLength(2)
    expect(data[0].title).toBe('Second todo')
  })

  it('creates a todo with valid input', async () => {
    const request = new NextRequest('http://localhost/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New todo' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)

    const data = await response.json()
    expect(data.title).toBe('New todo')
    expect(data.completed).toBe(false)
  })

  it('returns validation errors for invalid input', async () => {
    const request = new NextRequest('http://localhost/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe('Validation failed')
  })
})
