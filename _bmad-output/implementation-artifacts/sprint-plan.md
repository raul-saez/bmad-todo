---
project_name: bmad-todo
user_name: Raul
date: 2026-02-24
status: active
totalStories: 41
epics: 5
estimatedDuration: full-cycle-implementation
qaIntegration: continuous
---

# Complete Implementation Sprint Plan - bmad-todo

## Overview

This document outlines the complete implementation roadmap for bmad-todo, organizing 41 stories across 5 epics into logical execution phases with integrated QA throughout.

**Key Principles:**
- ✅ QA integrated with every story, not added at the end
- ✅ Stories executed in logical dependency order
- ✅ Tests written before/alongside implementation code
- ✅ Continuous validation and quality gates
- ✅ Each phase produces deployable artifacts

---

## Phase 1: Foundation & Test Infrastructure (Stories 1.1-1.3)

**Duration:** ~4-6 hours | **QA:** Immediate | **Output:** Runnable test environment

### Story 1.1: Initialize Next.js Project with Full Stack Setup
**Implementation:**
```bash
npx create-next-app@latest bmad-todo --typescript --tailwind --no-eslint
cd bmad-todo
npm install @prisma/client prisma zod axios
npx prisma init
```

**QA Checkpoint:**
- Verify project structure matches architecture
- Confirm dev server runs on localhost:3000
- Validate TypeScript strict mode enabled

### Story 1.2: Configure Test Infrastructure (Jest, RTL, CI/CD)
**Implementation:**
- Install Jest, @testing-library/react, @testing-library/jest-dom
- Create jest.config.ts with Next.js TypeScript support
- Create .github/workflows/test.yml for CI/CD
- Add test scripts to package.json

**QA Checkpoint:**
- Run `npm test` successfully
- Verify coverage reporting works
- Confirm CI/CD workflow is configured

### Story 1.3: Create Test Strategy Document & Fixtures
**Implementation:**
- Create docs/TESTING.md with test pyramid and conventions
- Create tests/fixtures/todos.fixtures.ts with sample data
- Create tests/mocks/prisma.ts with mocked Prisma client
- Create tests/mocks/broadcastChannel.ts with mock utilities

**QA Checkpoint:**
- Verify fixtures are importable and typed correctly
- Test mocks can be used in test files
- Documentation is clear and comprehensive

**End of Phase 1:** ✅ Project initialized, test infrastructure ready, first story ready to implement

---

## Phase 2: Backend Foundation (Story 1.4)

**Duration:** ~3-4 hours | **QA:** Integration tests for every endpoint | **Output:** Fully tested API

### Story 1.4: Create Todo Data Model + API Routes
**Implementation:**
- Define Todo schema in prisma/schema.prisma
- Run `npx prisma migrate dev --name init`
- Create API route: GET /api/todos (retrieve all)
- Create API route: POST /api/todos (create new)
- Create API route: GET /api/todos/[id] (retrieve single)
- Create API route: PATCH /api/todos/[id] (update)
- Create API route: DELETE /api/todos/[id] (delete)
- Add Zod validation for all inputs
- Wrap responses in {success, data/error} format

**QA Checkpoint:**
- ✅ Write integration test for each endpoint
- ✅ Test success and error responses
- ✅ Validate error codes match specification
- ✅ Test invalid input handling
- ✅ All endpoints respond with correct HTTP status codes
- ✅ Coverage >80% for API routes

**Test Coverage:**
```typescript
// tests/integration/api.integration.test.ts
describe('Todo API Routes', () => {
  describe('GET /api/todos', () => {
    it('returns empty array when no todos', async () => { ... });
    it('returns all todos with correct structure', async () => { ... });
  });
  
  describe('POST /api/todos', () => {
    it('creates a new todo with valid input', async () => { ... });
    it('returns 400 for missing title', async () => { ... });
    it('returns 400 for empty title', async () => { ... });
    // ... more tests
  });
  // ... PATCH, DELETE, GET [id] tests
});
```

**End of Phase 2:** ✅ Fully functional API with complete test coverage

---

## Phase 3: Frontend Components & Hooks (Stories 1.5-1.9)

**Duration:** ~6-8 hours | **QA:** Component tests + visual regression | **Output:** Working UI with all hooks

### Story 1.5: Build TodoList Component
**Implementation:**
- Create src/components/features/todos/TodoList.tsx
- Implement useTodos hook integration
- Create Active and Completed sections
- Add empty state messaging
- Add loading and error states

**QA Checkpoint:**
- ✅ Unit tests for component rendering
- ✅ Test section rendering (active/completed)
- ✅ Test empty state display
- ✅ Test loading/error states
- ✅ Component test coverage >80%

### Story 1.6: Create TodoForm Component
**Implementation:**
- Create src/components/features/todos/TodoForm.tsx
- Single input field for task entry
- Enter key submission handling
- Zod validation integration
- Error message display

**QA Checkpoint:**
- ✅ Unit tests for input handling
- ✅ Test Enter key submission
- ✅ Test validation error display
- ✅ Test empty input rejection
- ✅ Test clearing after successful submit

### Story 1.7: Create TodoItem Component
**Implementation:**
- Create src/components/features/todos/TodoItem.tsx
- Checkbox for completion toggle
- Delete button with confirmation
- Completed state styling
- Loading indicator during operations

**QA Checkpoint:**
- ✅ Unit tests for checkbox toggle
- ✅ Test delete confirmation flow
- ✅ Test loading states
- ✅ Test completed vs active styling

### Story 1.8: Add useTodos Hook
**Implementation:**
- Create src/hooks/useTodos.ts
- Implement fetch on mount
- Add optimistic updates
- Implement error handling with rollback
- Export: todos, loading, error, addTodo, updateTodo, deleteTodo

**QA Checkpoint:**
- ✅ Unit tests for hook initialization
- ✅ Test loading state
- ✅ Test error handling
- ✅ Test optimistic updates
- ✅ Test rollback on error

### Story 1.9: Add useTodoForm Hook
**Implementation:**
- Create src/hooks/useTodoForm.ts
- Input state management
- Zod validation integration
- Error state management
- Export: input, setInput, errors, submit, reset

**QA Checkpoint:**
- ✅ Unit tests for form state
- ✅ Test validation flow
- ✅ Test error clearing
- ✅ Test reset functionality

**End of Phase 3:** ✅ Complete working UI with all components and hooks tested

---

## Phase 4: Comprehensive Testing (Stories 1.10-1.11)

**Duration:** ~3-4 hours | **QA:** 100% test coverage verification | **Output:** Fully tested application

### Story 1.10: Unit Tests for All CRUD Operations (>80% Coverage)
**Implementation:**
- Complete all component unit tests
- Complete all hook unit tests
- Complete API route unit tests
- Achieve >80% coverage across all files
- Set up coverage enforcement in CI/CD

**QA Checkpoint:**
- ✅ Run `npm test -- --coverage`
- ✅ Verify >80% coverage for all files
- ✅ No "any" types in test files
- ✅ All critical paths tested
- ✅ CI/CD blocks on coverage drop

### Story 1.11: Integration Tests for Complete Workflows
**Implementation:**
- Test complete "Add Todo" workflow
- Test complete "Complete Todo" workflow
- Test complete "Delete Todo" workflow
- Test multiple operations in sequence
- Test error recovery paths

**QA Checkpoint:**
- ✅ All integration tests passing
- ✅ Tests cover user journeys from epics
- ✅ Error scenarios tested
- ✅ Edge cases validated

**End of Phase 4:** ✅ Epic 1 complete with >80% test coverage and all workflows validated

---

## Phase 5: Data Persistence Layer (Epic 2, Stories 2.1-2.7)

**Duration:** ~5-7 hours | **QA:** Storage reliability tests | **Output:** Persistent, recoverable data

### Story 2.1: Create IndexedDB Storage Service
**Implementation:**
- Create src/services/storage/indexedDB.ts
- Implement: init, saveTodo, getTodo, getAllTodos, updateTodo, deleteTodo, clearAll
- Add error handling for transactions

**QA Checkpoint:**
- ✅ Unit tests for all CRUD operations
- ✅ Test transaction handling
- ✅ Test IndexedDB lifecycle

### Story 2.2: Create localStorage Fallback Service
**Implementation:**
- Create src/services/storage/localStorage.ts
- Match IndexedDB interface
- Implement JSON serialization/deserialization
- Add error recovery for corrupted data

**QA Checkpoint:**
- ✅ Unit tests for all operations
- ✅ Test JSON handling
- ✅ Test corruption recovery

### Story 2.3: Create Storage Abstraction Layer with Fallback
**Implementation:**
- Create src/services/storage/storage.ts
- Detect IndexedDB availability
- Use IndexedDB with localStorage backup
- Implement fallback switching logic

**QA Checkpoint:**
- ✅ Integration tests for primary/fallback
- ✅ Test error recovery
- ✅ Test automatic fallback

### Story 2.4: Implement Data Persistence on Every User Action
**Implementation:**
- Integrate storage into TodoForm submission
- Integrate storage into checkbox completion
- Integrate storage into delete operations
- Add optimistic updates with persistence

**QA Checkpoint:**
- ✅ Integration tests for each operation
- ✅ Verify data saves before API response
- ✅ Test data consistency

### Story 2.5: Implement Crash Recovery
**Implementation:**
- On app initialization, load from storage
- Detect and recover from corruption
- Test: close browser, force crash, corrupt data

**QA Checkpoint:**
- ✅ Integration tests simulating crashes
- ✅ Verify data recovery
- ✅ Test corruption detection

### Story 2.6: Implement Session Recovery
**Implementation:**
- Verify data persists after browser close
- Test: close tab, close browser, reopen
- Confirm all todos restored

**QA Checkpoint:**
- ✅ Integration tests for session lifecycle
- ✅ Verify persistence across sessions
- ✅ Test with multiple sessions

### Story 2.7: Create Storage Integration Tests
**Implementation:**
- Comprehensive tests for all storage scenarios
- Test: IndexedDB, localStorage, fallback, recovery, corruption

**QA Checkpoint:**
- ✅ All storage scenarios covered
- ✅ Critical paths tested
- ✅ Edge cases validated

**End of Phase 5:** ✅ Data persists reliably, survives crashes, recovers cleanly

---

## Phase 6: Cross-Tab Synchronization (Epic 3, Stories 3.1-3.8)

**Duration:** ~6-8 hours | **QA:** Multi-tab sync tests | **Output:** Real-time sync across tabs

### Story 3.1: Create Broadcast Channel Wrapper Service
**Implementation:**
- Create src/services/sync/broadcastSync.ts
- Implement: createChannel, send, listen, close
- Add error handling for unsupported browsers

**QA Checkpoint:**
- ✅ Unit tests for channel operations
- ✅ Test message sending/receiving
- ✅ Test channel lifecycle

### Story 3.2: Create localStorage Polling Fallback
**Implementation:**
- Create src/services/sync/localStorageSync.ts
- Implement localStorage-based fallback
- Poll every 100ms for new messages

**QA Checkpoint:**
- ✅ Unit tests for polling mechanism
- ✅ Test message detection
- ✅ Test self-broadcast filtering

### Story 3.3: Create Conflict Resolver (Last-Write-Wins)
**Implementation:**
- Create src/services/sync/conflictResolver.ts
- Implement timestamp-based comparison
- Add tiebreaker logic for equal timestamps
- Implement undo for conflict losers

**QA Checkpoint:**
- ✅ Unit tests for conflict resolution
- ✅ Test timestamp comparison
- ✅ Test tiebreaker logic
- ✅ Test undo functionality

### Story 3.4: Create Sync Message Event Format
**Implementation:**
- Define message schema: {resource, action, data, timestamp, tabId}
- Create sync message validator (Zod schema)
- Implement sync queue handler

**QA Checkpoint:**
- ✅ Unit tests for message validation
- ✅ Test valid/invalid messages
- ✅ Test routing to handlers

### Story 3.5: Create Sync Context Provider
**Implementation:**
- Create src/components/providers/SyncProvider.tsx
- Expose: syncStatus, lastSyncTime, syncError
- Implement state management for sync

**QA Checkpoint:**
- ✅ Unit tests for context provision
- ✅ Test state updates
- ✅ Test hook usage

### Story 3.6: Create SyncStatus Component
**Implementation:**
- Create src/components/features/todos/SyncStatus.tsx
- Display: syncing, synced, error states
- Add retry button for errors

**QA Checkpoint:**
- ✅ Unit tests for status display
- ✅ Test state transitions
- ✅ Test visual feedback

### Story 3.7: Implement Sync Queue for Offline
**Implementation:**
- Create src/services/sync/syncQueue.ts
- Implement: enqueue, dequeue, flush, isPending
- Handle queue overflow

**QA Checkpoint:**
- ✅ Unit tests for queue operations
- ✅ Test ordering preservation
- ✅ Test overflow handling

### Story 3.8: Create Sync Integration Tests
**Implementation:**
- Test multi-tab scenarios (simulated)
- Test conflict resolution in action
- Test offline queue and flush

**QA Checkpoint:**
- ✅ Multi-tab sync tests
- ✅ Conflict resolution tests
- ✅ Offline recovery tests

**End of Phase 6:** ✅ Real-time sync across tabs, offline-first architecture working

---

## Phase 7: UI Polish & Accessibility (Epic 4, Stories 4.1-4.8)

**Duration:** ~5-7 hours | **QA:** Accessibility audit + visual testing | **Output:** WCAG AA compliant, polished UI

### Story 4.1: Full Keyboard Navigation (WCAG 2.1 AA)
**Implementation:**
- Add proper tab order to all components
- Implement keyboard handlers (Enter, Space, Escape)
- Add focus management
- Audit with WAVE tool

**QA Checkpoint:**
- ✅ Keyboard navigation tests
- ✅ Tab order verification
- ✅ No accessibility violations in WAVE

### Story 4.2: Screen Reader Support with ARIA
**Implementation:**
- Add ARIA labels to all interactive elements
- Implement live regions for dynamic updates
- Add semantic HTML structure
- Test with screen reader

**QA Checkpoint:**
- ✅ ARIA label tests
- ✅ Live region announcements
- ✅ Screen reader testing (VoiceOver/NVDA)

### Story 4.3: Responsive Design
**Implementation:**
- Implement mobile-first design
- Test at 320px, 375px, 768px, 1920px breakpoints
- Optimize touch targets (44x44px minimum)
- Test orientation changes

**QA Checkpoint:**
- ✅ Responsive tests at all breakpoints
- ✅ Touch target size verification
- ✅ Orientation change tests

### Story 4.4: Loading States
**Implementation:**
- Add loading spinner to list view
- Add loading indicator to form submission
- Add loading state to checkbox/delete
- Graceful fade for deletions

**QA Checkpoint:**
- ✅ Loading state visibility tests
- ✅ Visual regression tests
- ✅ Timing validation

### Story 4.5: Error States with Recovery
**Implementation:**
- Clear error messages for all failures
- Add retry buttons for recoverable errors
- Highlight invalid form fields
- Provide recovery instructions

**QA Checkpoint:**
- ✅ Error message clarity tests
- ✅ Retry functionality tests
- ✅ Error state visibility

### Story 4.6: Visual Polish & Microinteractions
**Implementation:**
- Add hover effects to interactive elements
- Implement smooth transitions (0.2s)
- Add checkmark animation for completion
- Add slide animations for add/remove

**QA Checkpoint:**
- ✅ Visual regression tests
- ✅ Animation frame rate tests (60fps)
- ✅ Interaction feedback tests

### Story 4.7: Error Boundary Component
**Implementation:**
- Create src/components/common/ErrorBoundary.tsx
- Catch React errors and display fallback UI
- Log errors for debugging

**QA Checkpoint:**
- ✅ Error boundary tests
- ✅ Fallback UI rendering
- ✅ Error logging verification

### Story 4.8: Accessibility Audit Checklist
**Implementation:**
- Create tests/a11y/accessibility.test.ts with axe-core
- Run Lighthouse audit (target: 95+ score)
- Manual keyboard + screen reader testing
- Create accessibility checklist

**QA Checkpoint:**
- ✅ axe-core tests passing
- ✅ Lighthouse accessibility score >95
- ✅ Manual testing checklist completed
- ✅ No keyboard or screen reader issues

**End of Phase 7:** ✅ Polished, accessible UI with WCAG AA compliance

---

## Phase 8: SEO, Documentation & CI/CD (Epic 5, Stories 5.1-5.7)

**Duration:** ~4-5 hours | **QA:** SEO audit + documentation validation | **Output:** Production-ready

### Story 5.1: Configure SEO Meta Tags & OG Data
**Implementation:**
- Set page title, description, meta tags
- Add Open Graph tags for social sharing
- Add Twitter Card tags
- Verify with SEO audit

**QA Checkpoint:**
- ✅ Meta tag verification
- ✅ Social sharing validation
- ✅ Lighthouse SEO score 100

### Story 5.2: Add Structured Data (Schema.org)
**Implementation:**
- Add WebApplication schema
- Add Website schema
- Test with Google Structured Data Tool

**QA Checkpoint:**
- ✅ Schema validation (no errors)
- ✅ Structured data test passing

### Story 5.3: Create Comprehensive README
**Implementation:**
- Document project overview
- Getting started guide (Install, Run, Test)
- Architecture overview
- Development workflow
- Deployment instructions

**QA Checkpoint:**
- ✅ README completeness
- ✅ All commands verified
- ✅ Links working

### Story 5.4: Create API Documentation
**Implementation:**
- Document all API endpoints
- Include example curl requests
- Show request/response formats
- Explain error codes

**QA Checkpoint:**
- ✅ All endpoints documented
- ✅ Examples are correct
- ✅ Readable and comprehensive

### Story 5.5: Create Deployment Guide
**Implementation:**
- Document environment setup
- Build process steps
- Database migration
- Platform-specific deployment (Vercel/Railway/Heroku)
- Rollback procedure

**QA Checkpoint:**
- ✅ Steps verified
- ✅ Deployment successful
- ✅ Rollback tested

### Story 5.6: Create Architecture Documentation
**Implementation:**
- Link to comprehensive architecture.md
- Summarize key decisions
- Explain patterns and conventions
- Document integration points

**QA Checkpoint:**
- ✅ Documentation linked
- ✅ All decisions explained
- ✅ Easy to understand

### Story 5.7: Set Up CI/CD Testing & Quality Gates
**Implementation:**
- Configure GitHub Actions workflow
- Set up automated test runs
- Enforce coverage threshold (>80%)
- Set up coverage badge
- Configure required status checks

**QA Checkpoint:**
- ✅ CI/CD workflow running
- ✅ Coverage enforcement active
- ✅ Merge blocks on failure
- ✅ Badge displaying

**End of Phase 8:** ✅ Production-ready with documentation, SEO, and automated quality gates

---

## Implementation Summary

**Total Stories:** 41  
**Total Phases:** 8  
**Integrated QA:** Continuous throughout all phases

### Deliverables by Phase

| Phase | Focus | Stories | Status |
|-------|-------|---------|--------|
| 1 | Foundation | 1.1-1.3 | Ready |
| 2 | Backend API | 1.4 | Depends on Phase 1 |
| 3 | Frontend | 1.5-1.9 | Depends on Phase 2 |
| 4 | Testing | 1.10-1.11 | Depends on Phases 2-3 |
| 5 | Persistence | 2.1-2.7 | Parallel with Phase 3 |
| 6 | Sync | 3.1-3.8 | Depends on Phase 5 |
| 7 | Polish | 4.1-4.8 | Parallel with Phase 6 |
| 8 | Docs | 5.1-5.7 | Final phase |

### QA Coverage

- ✅ Unit tests: 80%+ coverage throughout
- ✅ Integration tests: Every API endpoint and workflow
- ✅ Component tests: All UI components
- ✅ E2E tests: Complete user journeys
- ✅ Accessibility tests: WCAG AA compliance
- ✅ Performance tests: <100ms user actions
- ✅ Regression tests: Visual + functionality

### Success Criteria

- ✅ All 47 FRs implemented and tested
- ✅ All 37 NFRs met and validated
- ✅ >80% code coverage
- ✅ WCAG AA accessibility
- ✅ All tests passing
- ✅ CI/CD green
- ✅ Deployment ready

---

## Next Step

Execute Phase 1 to initialize the project and set up test infrastructure, then proceed sequentially through remaining phases.

**Status:** Ready for implementation  
**Last Updated:** 2026-02-24
