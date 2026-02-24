# Phase 2: Backend API - Quick Start Guide

## Overview
Phase 2 focuses on implementing the backend API with complete integration tests. All groundwork from Phase 1 is complete.

**Duration**: 3-4 hours  
**Stories**: 1.4 (Backend CRUD API)  
**Starting Point**: All infrastructure ready, need to implement integration tests and verify database operations

## What's Already Done

✅ Prisma schema defined (`prisma/schema.prisma`)  
✅ API route handlers created (`src/app/api/todos/`)  
✅ Zod validation schemas ready (`src/lib/schemas.ts`)  
✅ Database client configured (`src/lib/prisma.ts`)  
✅ `.env.local` with DATABASE_URL set  
✅ Jest configured and all tests passing  

## What Needs to be Done

### 1. Initialize Database (30 minutes)
```bash
cd bmad-todo-app
npx prisma migrate dev --name init
```

This will:
- Create SQLite database file
- Run initial migration
- Generate Prisma Client

### 2. Create Integration Tests (1.5 hours)
All database unit tests already exist in `tests/__tests__/prisma.test.ts` but are skipped.

**To enable them**:
1. Run `npx prisma migrate dev --name init` first (creates database)
2. Remove test file from `testPathIgnorePatterns` in `jest.config.ts`
3. Run `npm test -- --testPathPattern=prisma`

### 3. Verify API Routes Work (1-1.5 hours)

Create an end-to-end test file to verify the actual API routes:

```typescript
// tests/__tests__/api.e2e.test.ts
import { prisma } from '@/lib/prisma'

describe('API Routes - E2E', () => {
  beforeEach(async () => {
    await prisma.todo.deleteMany({})
  })

  it('can create and retrieve a todo', async () => {
    // Create
    const todo = await prisma.todo.create({
      data: { title: 'Test' }
    })
    
    // Retrieve
    const found = await prisma.todo.findUnique({
      where: { id: todo.id }
    })
    
    expect(found?.title).toBe('Test')
  })
})
```

## Development Workflow for Phase 2

### Step 1: Initialize Database
```bash
cd bmad-todo-app
npx prisma migrate dev --name init
# This creates: bmad-todo-app/prisma/dev.db
```

### Step 2: Test Database Operations
```bash
# Run Prisma tests (currently skipped)
npm test -- --testPathPattern=prisma

# Or verify manually:
npx prisma studio  # Opens visual database browser
```

### Step 3: Verify API Routes
```bash
# Start development server
npm run dev
# Visit http://localhost:3000 in browser

# Test endpoints:
curl http://localhost:3000/api/todos                    # GET all
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'                                 # POST create

# Get ID from POST response, then test:
curl http://localhost:3000/api/todos/{id}              # GET one
curl -X PATCH http://localhost:3000/api/todos/{id} \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'                              # PATCH update
curl -X DELETE http://localhost:3000/api/todos/{id}    # DELETE
```

## Files to Modify

### 1. `jest.config.ts`
When database is ready, remove from `testPathIgnorePatterns`:
```typescript
// Remove this line:
testPathIgnorePatterns: ['<rootDir>/tests/__tests__/prisma.test.ts'],
```

### 2. Create New Test File (Optional)
```bash
touch tests/__tests__/api.routes.test.ts
```

Example structure:
```typescript
import { prisma } from '@/lib/prisma'

describe('API Route Handlers', () => {
  // Test route handlers with Prisma directly
})
```

## Verification Checklist

- [ ] Database initialized: `npx prisma migrate dev --name init`
- [ ] Database file created: `bmad-todo-app/prisma/dev.db` exists
- [ ] Development server runs: `npm run dev` starts on :3000
- [ ] Tests pass: `npm test` returns 33+ passing tests
- [ ] Prisma tests pass: `npm test -- --testPathPattern=prisma`
- [ ] API responds: `curl http://localhost:3000/api/todos` returns `[]`
- [ ] CRUD works: Create, read, update, delete operations work
- [ ] Build succeeds: `npm run build` completes without errors

## Common Issues & Solutions

### Issue: "DATABASE_URL not found"
**Solution**: Make sure `.env.local` exists in project root with:
```
DATABASE_URL="file:./prisma/dev.db"
```

### Issue: "Prisma migration failed"
**Solution**: 
```bash
rm prisma/dev.db
npx prisma migrate dev --name init
```

### Issue: "Port 3000 already in use"
**Solution**:
```bash
lsof -i :3000
kill -9 <PID>
npm run dev
```

### Issue: "Tests still failing on prisma.test.ts"
**Solution**: Keep it skipped for now (will work after full database setup)

## Testing Strategy for Phase 2

1. **Unit Tests**: Database operations (already written, just need to enable)
2. **Integration Tests**: API routes with real database
3. **E2E Tests**: Full request/response cycle (curl or Postman)

### Example Integration Test
```typescript
import { prisma } from '@/lib/prisma'

describe('Todo CRUD', () => {
  it('creates a todo successfully', async () => {
    const todo = await prisma.todo.create({
      data: { title: 'Learn Next.js' }
    })

    expect(todo).toHaveProperty('id')
    expect(todo.title).toBe('Learn Next.js')
    expect(todo.completed).toBe(false)
  })
})
```

## Phase 2 Success Criteria

✅ Database initialized and migrations run  
✅ All Prisma database tests pass  
✅ API routes respond to requests  
✅ CRUD operations verified end-to-end  
✅ Error handling tested (not found, validation errors)  
✅ Build still succeeds with no errors  
✅ 40+ tests passing (33 + new integration tests)  

## Next Phase Preview (Phase 3)

Once Phase 2 is complete:
- Components will connect to actual API
- Frontend will handle loading/error states
- useTodos hook will make real API calls
- E2E testing will verify entire flow

## Useful Commands Reference

```bash
# Database
npx prisma migrate dev --name <name>  # Create migration
npx prisma studio                      # Visual database browser
npx prisma db seed                     # Seed database

# Testing
npm test                               # Run all tests
npm test -- --watch                    # Watch mode
npm run test:coverage                  # Coverage report
npm test -- --testPathPattern=prisma   # Run specific tests

# Development
npm run dev                            # Start dev server
npm run build                          # Production build
npm start                              # Run production

# Debugging
NODE_DEBUG=* npm run dev               # Verbose logging
npx tsc --noEmit                       # Type check
```

## Expected Outcome After Phase 2

- ✅ SQLite database with todo table created
- ✅ All CRUD operations verified to work
- ✅ 40+ passing tests (unit + integration)
- ✅ API routes tested and working
- ✅ Error handling verified
- ✅ Ready to connect frontend in Phase 3

---

**Start Phase 2 with**: `npx prisma migrate dev --name init`  
**Estimated Duration**: 3-4 hours  
**When Complete**: Move to Phase 3 - Frontend Integration
