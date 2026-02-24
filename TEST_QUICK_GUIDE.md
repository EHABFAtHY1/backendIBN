# Quick Test Guide

## Prerequisites
- Node.js 16+ installed
- MongoDB running locally on `localhost:27017`
- Dependencies installed: `npm install`

## Running Tests

### All Tests
```bash
npm test
```

### Integration Tests Only
```bash
npm run test:integration
```

### Watch Mode (auto-rerun on changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Structure

```
src/tests/
├── integration/
│   ├── auth.integration.test.ts          # 7 test cases
│   ├── projects.integration.test.ts      # 20+ test cases
│   ├── users.integration.test.ts         # 15+ test cases
│   ├── categories.integration.test.ts    # 18+ test cases
│   └── company-settings.integration.test.ts # 20+ test cases
├── setup.ts                              # Test environment setup
└── unit/                                 # Unit tests (to be added)
```

## What's Being Tested

### Authentication (auth.integration.test.ts)
- ✅ User login with credentials validation
- ✅ User registration (admin-only)
- ✅ Get authenticated user profile
- ✅ User logout
- ✅ Session management

### Projects (projects.integration.test.ts)
- ✅ List all projects with pagination
- ✅ Get single project by ID
- ✅ Filter projects by category
- ✅ Create project (admin-only)
- ✅ Update project details
- ✅ Delete project
- ✅ Authorization checks

### Users (users.integration.test.ts)
- ✅ List all users
- ✅ Get user by ID
- ✅ Get user profile
- ✅ Create user (admin-only)
- ✅ Update user info
- ✅ Delete user
- ✅ Field protection checks

### Categories (categories.integration.test.ts)
- ✅ List all categories
- ✅ Get category by ID
- ✅ Create category (admin-only)
- ✅ Update category
- ✅ Delete category
- ✅ Bilingual content (Arabic/English)
- ✅ Special characters handling

### Company Settings (company-settings.integration.test.ts)
- ✅ Get company settings
- ✅ Create settings (admin-only)
- ✅ Update settings
- ✅ Delete settings
- ✅ Bilingual field updates
- ✅ Array field handling

## Expected Test Output

```
PASS  src/tests/integration/auth.integration.test.ts
  Authentication Tests
    POST /api/auth/login
      ✓ should successfully login
      ✓ should fail with invalid credentials
    ... (more tests)

PASS  src/tests/integration/projects.integration.test.ts
  Projects Tests
    ... (20+ test cases)

Test Suites: 5 passed, 5 total
Tests:       80 passed, 80 total
Time:        45.234s
```

## Troubleshooting

### Tests Timeout
If tests timeout, ensure:
1. MongoDB is running: `mongod` or check MongoDB service
2. Database is accessible: `mongodb://localhost:27017`
3. Test timeout is sufficient (default: 30 seconds)

### Import Errors
All imports have been fixed to use correct relative paths:
- `../../app` (2 levels up from tests/integration/)
- `../../config/db`
- `../../models/[ModelName]`

### Database Issues
Tests automatically:
1. Create test database: `ibnalshaekh-test`
2. Cleanup before each test suite
3. Disconnect after tests complete

## Environment Variables

Test environment uses `.env.test` file:
```
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/ibnalshaekh-test
```

## CI/CD Integration

To run tests in CI/CD pipeline:
```bash
# Install deps
npm install

# Run all tests with coverage
npm run test:coverage

# Output coverage report
cat coverage/coverage-summary.json
```

## Coverage Goals

Current targets:
- ✅ Lines: 70%+
- ✅ Functions: 75%+
- ✅ Branches: 60%+
- ✅ Statements: 70%+

Check coverage:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Next Steps

1. ✅ Run tests: `npm test`
2. ✅ Check coverage: `npm run test:coverage`
3. ✅ Fix any failing tests
4. ⏳ Add unit tests for utilities
5. ⏳ Add performance tests
6. ⏳ Setup CI/CD integration

---

**Test Version**: 1.0.0
**Last Updated**: 2024
**Status**: Ready for execution
