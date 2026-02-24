# Testing Strategy

This document outlines the comprehensive testing approach for bmad-todo, covering unit tests, integration tests, E2E tests, and accessibility testing.

## Overview

- **Test Framework**: Jest + React Testing Library
- **Coverage Target**: 80% global threshold (branches, functions, lines, statements)
- **Test Types**: Unit, Integration, E2E, Accessibility
- **CI/CD**: GitHub Actions with automated testing on push and PR

## Testing Pyramid

```
     E2E Tests (Cypress)
  Integration Tests (Jest)
   Unit Tests (Jest + RTL)
```

## Unit Testing

### What We Test
- Individual functions and utilities
- Component rendering with various props
- Hook behavior in isolation
- Schema validation

### Tools
- Jest
- React Testing Library
- @testing-library/user-event

### Example Structure
```
src/
├── components/
│   └── TodoItem/
│       ├── TodoItem.tsx
│       └── __tests__/
│           └── TodoItem.test.tsx
├── hooks/
│   └── useTodos/
│       ├── useTodos.ts
│       └── __tests__/
│           └── useTodos.test.ts
└── lib/
    └── schemas.ts
    └── __tests__/
        └── schemas.test.ts
```

### Coverage Targets
- **Components**: 80%+ (test rendering, props, events)
- **Hooks**: 80%+ (test state, side effects)
- **Utils**: 90%+ (test all branches)
- **Schemas**: 100% (test all validation rules)

## Integration Testing

### What We Test
- API route handlers with database
- Component integration with hooks
- Multi-component workflows
- Database transactions

### Tools
- Jest with jsdom
- Test fixtures for seeding
- Prisma ORM for database operations

### API Testing
Each route has integration tests covering:
- ✅ Happy path (valid input)
- ❌ Error cases (invalid input, not found)
- 🔒 Edge cases (empty arrays, boundary values)

### Examples
- `GET /api/todos` - returns all todos, empty array
- `POST /api/todos` - creates with validation, rejects invalid
- `PATCH /api/todos/[id]` - updates partially, handles missing
- `DELETE /api/todos/[id]` - deletes and verifies removal

## E2E Testing

### What We Test
- User workflows end-to-end
- Cross-browser compatibility
- Real database interactions
- Multi-tab sync behavior

### Tools
- Cypress or Playwright
- Real database (not mocked)
- Browser automation

### Test Scenarios
1. **Create Todo**: User creates new todo, sees it in list
2. **Edit Todo**: User edits todo, changes persist
3. **Complete Todo**: User marks done, UI reflects change
4. **Delete Todo**: User deletes, todo removed from list
5. **Sync**: Open in multiple tabs, changes sync in real-time
6. **Persistence**: Refresh page, todos still exist
7. **Accessibility**: Keyboard navigation, screen readers

## Accessibility Testing

### What We Test
- WCAG 2.1 Level AA compliance
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader compatibility
- Color contrast ratios
- Form labels and ARIA attributes

### Tools
- jest-axe (automated checks)
- Manual keyboard navigation
- Screen reader testing (NVDA, JAWS)

### Key Components
- All form inputs must have labels
- Buttons must be keyboard accessible
- Focus indicators visible
- Color not sole method of communication
- Semantic HTML structure

## Mock Strategy

### What We Mock
- Database (Prisma in unit tests)
- Broadcast Channel API (cross-tab sync)
- Fetch API (when testing components)
- localStorage (when testing persistence)

### What We Don't Mock
- React components
- Next.js routing (in E2E)
- Real database (in integration/E2E)

### Mock Locations
```
tests/
├── fixtures/
│   └── todos.fixtures.ts       # Test data factories
├── mocks/
│   ├── broadcastChannel.ts     # Multi-tab sync mock
│   ├── prisma.ts               # Database mock (jest.setup)
│   └── localStorage.ts         # Storage mock
└── helpers/
    └── db.ts                   # Database utilities
```

## Test Execution

### Run All Tests
```bash
npm test
```

### Run Specific Suite
```bash
npm test -- TodoItem.test.tsx
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Watch Mode
```bash
npm test -- --watch
```

### E2E Tests
```bash
npm run test:e2e
# or
npm run test:e2e:open  # Opens Cypress UI
```

## Coverage Thresholds

Global minimums enforced:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

Exceptions documented in jest.config.ts with rationale.

## CI/CD Integration

### GitHub Actions
- Runs on every push to main/develop
- Runs on every PR
- Tests node 18.x and 20.x
- Uploads coverage to Codecov
- Fails if coverage drops below thresholds

### Pre-commit Hooks
```bash
# Run before commit to catch issues early
husky pre-commit hook runs: npm test
```

## Best Practices

### ✅ Do
- Test behavior, not implementation
- Use semantic queries (getByRole, getByLabelText)
- Keep tests close to usage (don't test internals)
- Use factories for test data
- Test error states and edge cases
- Use descriptive test names

### ❌ Don't
- Test implementation details
- Use test IDs when semantic queries work
- Create interdependent tests
- Mock everything (mock sparingly)
- Test third-party libraries
- Write tests only for happy paths

## Debugging Tests

### Visual Debugging
```typescript
import { screen } from '@testing-library/react'
screen.debug() // Prints DOM
```

### Watch Specific Tests
```bash
npm test -- --watch --testNamePattern="TodoItem renders"
```

### Chrome DevTools
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
# Then open chrome://inspect
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [jest-axe](https://github.com/nickcolley/jest-axe)
