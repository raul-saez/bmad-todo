# API Documentation

This document describes the REST API endpoints for the bmad-todo application.

## Base URL

```
http://localhost:3000/api
```

## Endpoints

### Todos

#### Get All Todos

Retrieves all todos ordered by creation date (newest first).

**Endpoint:** `GET /api/todos`

**Response:** `200 OK`

```json
[
  {
    "id": "clxxx...",
    "title": "Buy groceries",
    "completed": false,
    "createdAt": "2026-02-24T10:30:00.000Z",
    "updatedAt": "2026-02-24T10:30:00.000Z"
  }
]
```

**Error Response:** `500 Internal Server Error`

```json
{
  "error": "Failed to fetch todos"
}
```

---

#### Create Todo

Creates a new todo item.

**Endpoint:** `POST /api/todos`

**Request Body:**

```json
{
  "title": "Buy groceries"
}
```

**Validation:**
- `title` (required): String, 1-500 characters

**Response:** `201 Created`

```json
{
  "id": "clxxx...",
  "title": "Buy groceries",
  "completed": false,
  "createdAt": "2026-02-24T10:30:00.000Z",
  "updatedAt": "2026-02-24T10:30:00.000Z"
}
```

**Error Responses:**

`400 Bad Request` - Invalid input

```json
{
  "error": "Invalid input",
  "details": [
    {
      "path": ["title"],
      "message": "Title is required"
    }
  ]
}
```

`500 Internal Server Error`

```json
{
  "error": "Failed to create todo"
}
```

---

#### Get Single Todo

Retrieves a specific todo by ID.

**Endpoint:** `GET /api/todos/[id]`

**Parameters:**
- `id` (path): Todo ID (CUID format)

**Response:** `200 OK`

```json
{
  "id": "clxxx...",
  "title": "Buy groceries",
  "completed": false,
  "createdAt": "2026-02-24T10:30:00.000Z",
  "updatedAt": "2026-02-24T10:30:00.000Z"
}
```

**Error Responses:**

`404 Not Found`

```json
{
  "error": "Todo not found"
}
```

`500 Internal Server Error`

```json
{
  "error": "Failed to fetch todo"
}
```

---

#### Update Todo

Updates an existing todo (title and/or completion status).

**Endpoint:** `PATCH /api/todos/[id]`

**Parameters:**
- `id` (path): Todo ID (CUID format)

**Request Body:**

```json
{
  "title": "Buy groceries and cook dinner",
  "completed": true
}
```

**Validation:**
- `title` (optional): String, 1-500 characters
- `completed` (optional): Boolean

**Response:** `200 OK`

```json
{
  "id": "clxxx...",
  "title": "Buy groceries and cook dinner",
  "completed": true,
  "createdAt": "2026-02-24T10:30:00.000Z",
  "updatedAt": "2026-02-24T11:45:00.000Z"
}
```

**Error Responses:**

`400 Bad Request` - Invalid input

```json
{
  "error": "Invalid input",
  "details": [
    {
      "path": ["title"],
      "message": "Title must be less than 500 characters"
    }
  ]
}
```

`404 Not Found`

```json
{
  "error": "Todo not found"
}
```

`500 Internal Server Error`

```json
{
  "error": "Failed to update todo"
}
```

---

#### Delete Todo

Deletes a specific todo.

**Endpoint:** `DELETE /api/todos/[id]`

**Parameters:**
- `id` (path): Todo ID (CUID format)

**Response:** `204 No Content`

**Error Responses:**

`404 Not Found`

```json
{
  "error": "Todo not found"
}
```

`500 Internal Server Error`

```json
{
  "error": "Failed to delete todo"
}
```

---

## Data Models

### Todo

```typescript
interface Todo {
  id: string // CUID
  title: string // 1-500 characters
  completed: boolean
  createdAt: Date
  updatedAt: Date
}
```

### CreateTodoInput

```typescript
interface CreateTodoInput {
  title: string // Required, 1-500 characters
}
```

### UpdateTodoInput

```typescript
interface UpdateTodoInput {
  title?: string // Optional, 1-500 characters
  completed?: boolean // Optional
}
```

---

## Error Handling

All endpoints return errors in a consistent format:

```typescript
interface ErrorResponse {
  error: string // Human-readable error message
  details?: Array<{
    path: string[]
    message: string
  }> // Validation errors (optional)
}
```

### HTTP Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `204 No Content` - Resource deleted successfully
- `400 Bad Request` - Invalid input or validation error
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Rate Limiting

Currently, no rate limiting is implemented. This is a local application intended for personal use.

---

## CORS

CORS is configured to allow requests from:
- `http://localhost:3000` (development)
- Production domain (when deployed)

---

## Examples

### Using cURL

**Get all todos:**
```bash
curl http://localhost:3000/api/todos
```

**Create a todo:**
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries"}'
```

**Update a todo:**
```bash
curl -X PATCH http://localhost:3000/api/todos/clxxx... \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

**Delete a todo:**
```bash
curl -X DELETE http://localhost:3000/api/todos/clxxx...
```

### Using JavaScript Fetch

**Get all todos:**
```javascript
const response = await fetch('/api/todos')
const todos = await response.json()
```

**Create a todo:**
```javascript
const response = await fetch('/api/todos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Buy groceries' })
})
const todo = await response.json()
```

**Update a todo:**
```javascript
const response = await fetch(`/api/todos/${id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ completed: true })
})
const updated = await response.json()
```

**Delete a todo:**
```javascript
await fetch(`/api/todos/${id}`, {
  method: 'DELETE'
})
```

---

## Testing

API endpoints are tested with Jest and React Testing Library. See:
- `/tests/api/todos.route.test.ts`
- `/tests/api/todos-id.route.test.ts`

Run API tests:
```bash
npm test -- tests/api
```
