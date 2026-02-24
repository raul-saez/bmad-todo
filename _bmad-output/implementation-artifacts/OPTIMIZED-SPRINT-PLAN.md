# Optimized Sprint Plan - Lean Delivery

**Goal**: Deliver a fully functional Todo app in ~20 hours instead of 40  
**Strategy**: Combine phases, skip lower-priority features, focus on core value

---

## Revised Timeline

| Phase | Original | Optimized | What's Different |
|-------|----------|-----------|------------------|
| 1. Foundation | ✅ 4-6h | ✅ Done | — |
| 2+3. Backend+Frontend | 9-12h | **8-10h** | Parallel work, fewer endpoints initially |
| 4. Testing | 3-4h | **2-3h** | Happy path + error cases only |
| 5. Persistence | 5-7h | **2-3h** | localStorage only (no IndexedDB) |
| 6. Sync | 6-8h | **2-3h** | Basic broadcast (no conflict resolution) |
| 7. UI Polish | 5-7h | **SKIP** | No dark mode, minimal animations |
| 8. Docs | 4-5h | **2h** | API reference only |
| | **30-40h** | **~20h** | **50% time reduction** |

---

## What We're Skipping (Low Priority)

🚫 Dark mode support  
🚫 Advanced animations/transitions  
🚫 IndexedDB optimization  
🚫 Multi-user conflict resolution  
🚫 Deployment documentation  
🚫 Performance profiling  

These can be added later if needed, but aren't essential for core functionality.

---

## Optimized Phases

### Phase 1: ✅ Foundation (DONE)
- ✅ Next.js + TypeScript setup
- ✅ Component library (TodoItem, TodoForm, TodoList)
- ✅ Hook layer (useTodos, useTodoForm)
- ✅ 33 passing tests
- ✅ Test infrastructure

---

### Phase 2+3: Backend + Frontend (8-10 hours)
**Combine API development with frontend integration**

#### What Gets Built:
- Initialize Prisma database
- Implement 5 core API endpoints (GET all, POST, GET one, PATCH, DELETE)
- Write integration tests (5-8 tests, fast)
- Connect React components to API
- Handle loading/error states
- Verify CRUD works end-to-end

#### Estimated Breakdown:
- Database setup + migrations: 30m
- API integration tests: 2h
- Frontend connection: 1.5h
- Component state management: 1.5h
- E2E verification: 1h
- **Subtotal: 8-10h** (including buffer)

#### Success Criteria:
- ✅ All CRUD operations work
- ✅ 40+ tests passing
- ✅ App fully functional at localhost:3000
- ✅ Real database working

---

### Phase 4: E2E Testing (2-3 hours)
**Cypress tests for happy path + error cases**

#### What Gets Built:
- 5-8 Cypress tests
- Happy path: Create → Read → Update → Delete
- Error cases: Empty input, not found, validation
- Visual regression checks

#### Estimated Breakdown:
- Cypress setup: 30m
- Happy path tests: 1h
- Error cases: 30m
- **Subtotal: 2-3h**

---

### Phase 5: Persistence (2-3 hours)
**localStorage caching (skip IndexedDB)**

#### What Gets Built:
- localStorage sync on every CRUD operation
- Auto-load from cache on page load
- Simple cache invalidation

#### What We're Skipping:
- 🚫 IndexedDB (too complex, localStorage sufficient)
- 🚫 Advanced cache strategies
- 🚫 Offline-first sync

#### Estimated Breakdown:
- Cache middleware: 1h
- localStorage hooks: 1h
- Testing: 30m
- **Subtotal: 2-3h**

---

### Phase 6: Basic Sync (2-3 hours)
**Multi-tab sync (skip conflict resolution)**

#### What Gets Built:
- BroadcastChannel API for cross-tab communication
- Real-time updates when other tabs change data
- Simple "last-write-wins" conflict handling

#### What We're Skipping:
- 🚫 Sophisticated conflict resolution
- 🚫 Operational transformation
- 🚫 Server-side synchronization
- 🚫 Offline sync queue

#### Estimated Breakdown:
- Broadcast setup: 30m
- Tab sync hooks: 1h
- Testing: 30m
- **Subtotal: 2-3h**

---

### Phase 7: Documentation (2 hours)
**API docs only (skip deployment, performance tuning)**

#### What Gets Built:
- API endpoint reference
- Setup instructions
- How to run tests
- Component usage guide

#### What We're Skipping:
- 🚫 Deployment guide
- 🚫 Performance optimization docs
- 🚫 Architecture decision records
- 🚫 Troubleshooting guide

#### Estimated Breakdown:
- API reference: 1h
- Setup/usage docs: 1h
- **Subtotal: 2h**

---

## Dependency Flow

```
Phase 1: Foundation ✅
    ↓
Phase 2+3: Backend + Frontend (do in parallel)
    ├── Backend: DB + API routes + integration tests
    └── Frontend: Components + API connection
    ↓
Phase 4: E2E Testing (happy path)
    ↓
Phase 5: localStorage Persistence
    ↓
Phase 6: Cross-Tab Sync
    ↓
Phase 7: Documentation
```

---

## Updated Metrics

| Metric | Original | Optimized |
|--------|----------|-----------|
| Total Time | 30-40h | ~20h |
| Phases | 8 | 7 (combined) |
| Test Coverage | 75%+ | 70%+ |
| Core Features | All | Yes, all |
| Nice-to-Have | Yes | No |

---

## What Stays Fully Featured

✅ **All core CRUD operations** - Create, read, update, delete  
✅ **Component library** - TodoItem, TodoForm, TodoList  
✅ **Comprehensive tests** - 40+ passing tests  
✅ **Type safety** - TypeScript strict mode  
✅ **Accessibility** - WCAG 2.1 Level AA  
✅ **Real database** - SQLite + Prisma  
✅ **Multi-tab sync** - BroadcastChannel API  
✅ **Data persistence** - localStorage  

---

## Quick Start Phase 2+3

```bash
cd bmad-todo-app

# 1. Initialize database
npx prisma migrate dev --name init

# 2. Write integration tests
npm test -- --watch

# 3. Start dev server
npm run dev

# 4. Test in browser
# Create a todo, refresh page, open in another tab
# Verify CRUD and multi-tab sync work
```

---

## Success Criteria for Lean MVP

By the end of Phase 6, you'll have a complete, working app:

✅ Create todos  
✅ List todos  
✅ Mark complete/incomplete  
✅ Delete todos  
✅ Data persists after refresh  
✅ Multi-tab sync works  
✅ Tests verify everything  
✅ No console errors  
✅ Responsive design  
✅ Keyboard accessible  

---

## Future Enhancements (If Needed)

If you want to add these later:
- Dark mode (1-2h)
- Animations (1-2h)  
- IndexedDB (2-3h)
- Server backend (4-6h)
- User authentication (3-4h)

But they're not needed for MVP.

---

## Timeline Summary

```
Phase 1 (Done):     ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 4-6h
Phase 2+3 (Next):   ███████████████████░░░░░░░░░░░░░░░░░░░░ 8-10h
Phase 4 (Testing):  ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 2-3h
Phase 5 (Storage):  ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 2-3h
Phase 6 (Sync):     ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 2-3h
Phase 7 (Docs):     ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 2h

Total: ~20-25 hours for fully functional MVP
```

---

**Status**: Phase 1 ✅ Done | Phase 2+3 ⏳ Ready to Start  
**Next**: Run `npx prisma migrate dev --name init`
