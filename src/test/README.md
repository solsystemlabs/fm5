# Testing Documentation

This document provides comprehensive information about the testing setup and strategies for the User Profile Management feature.

## Testing Framework Overview

### Stack
- **Unit Testing**: Vitest + React Testing Library
- **Integration Testing**: Vitest with MSW (Mock Service Worker)
- **E2E Testing**: Playwright
- **Mocking**: MSW for API mocking, vi.fn() for function mocking
- **Coverage**: Vitest with v8 coverage provider

### Test Structure

```
src/test/
├── setup.ts                   # Global test setup
├── utils/
│   └── test-utils.tsx         # Custom render functions and utilities
├── mocks/
│   ├── server.ts              # MSW server setup
│   └── handlers.ts            # API mock handlers
├── fixtures/
│   └── user-profile.ts        # Test data fixtures
├── integration/
│   └── profile-api.test.ts    # API integration tests
└── e2e/
    └── profile-workflows.spec.ts # End-to-end tests
```

## Test Categories

### 1. Unit Tests (`__tests__/*.test.tsx`)

**Purpose**: Test individual components in isolation
**Location**: `src/components/profile/__tests__/`

**Coverage**:
- ProfileInfoForm - Form validation, submission, error handling
- SecurityForm - Password/email changes, validation
- SettingsForm - Preference updates, state management
- AvatarUpload - File validation, upload/delete functionality
- ActivityHistory - Data display, pagination, refresh

**Key Testing Patterns**:
```tsx
import { render, screen, userEvent, waitFor } from '@/test/utils/test-utils';

test('validates required fields', async () => {
  const user = userEvent.setup();
  render(<ProfileInfoForm userProfile={mockProfile} onUpdate={mockFn} />);
  
  await user.clear(screen.getByLabelText('Display Name'));
  await user.tab();
  
  await waitFor(() => {
    expect(screen.getByText('Display name is required')).toBeVisible();
  });
});
```

### 2. Integration Tests (`integration/*.test.ts`)

**Purpose**: Test API endpoints with realistic request/response cycles
**Location**: `src/test/integration/`

**Coverage**:
- GET /api/users/me - Profile retrieval
- PUT /api/users/me - Profile updates
- PUT /api/users/me/password - Password changes
- PUT /api/users/me/email - Email changes
- GET/PUT /api/users/me/settings - Settings management
- POST/DELETE /api/users/me/avatar - Avatar operations
- GET /api/users/me/activity - Activity history

**Key Testing Patterns**:
```typescript
test('updates user profile successfully', async () => {
  const updateData = { name: 'Updated Name', profile: { bio: 'New bio' } };
  
  const response = await fetch('/api/users/me', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  });
  
  expect(response.ok).toBe(true);
  const result = await response.json();
  expect(result.name).toBe('Updated Name');
});
```

### 3. E2E Tests (`e2e/*.spec.ts`)

**Purpose**: Test complete user workflows across the entire application
**Location**: `src/test/e2e/`

**Coverage**:
- Complete profile update workflows
- Tab navigation and state persistence
- Form validation and error scenarios
- Avatar upload/delete workflows
- Settings changes and persistence
- Responsive design across devices
- Accessibility compliance

**Key Testing Patterns**:
```typescript
test('should update profile information successfully', async ({ page }) => {
  await page.goto('/profile');
  await page.fill('[name="name"]', 'Updated Name');
  await page.click('button:has-text("Save Changes")');
  
  await expect(page.getByText('Profile updated successfully!')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Updated Name' })).toBeVisible();
});
```

## Mock Strategy

### MSW (Mock Service Worker)
Used for intercepting and mocking API requests during testing.

**Setup**: Handlers defined in `src/test/mocks/handlers.ts`
**Usage**: Automatic interception in unit/integration tests

**Benefits**:
- Realistic request/response cycles
- Error scenario simulation
- Network condition testing
- Browser and Node.js compatibility

### Test Fixtures
Centralized test data in `src/test/fixtures/user-profile.ts`

```typescript
export const mockUserProfile: UserProfileResponse = {
  id: 'user_123',
  email: 'john.doe@example.com',
  name: 'John Doe',
  // ... complete profile structure
};

export const createMockUserProfile = (overrides = {}) => ({
  ...mockUserProfile,
  ...overrides
});
```

## Running Tests

### Local Development

```bash
# Run all unit tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests once with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug

# Run all tests (unit + E2E)
npm run test:all
```

### CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/test.yml`) runs:

1. **Unit Tests**: Fast feedback on component functionality
2. **Integration Tests**: API endpoint validation with test database
3. **E2E Tests**: Full workflow validation across browsers
4. **Security Scan**: Dependency vulnerability checks
5. **Build Verification**: Type checking and build validation

## Coverage Targets

### Minimum Coverage Requirements
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

### Coverage Exclusions
- Generated files (`routeTree.gen.ts`)
- Type definitions (`*.d.ts`)
- Test files themselves
- Build artifacts
- Configuration files

## Test Data Management

### User Profile Test Data
- **mockUserProfile**: Complete profile with all fields populated
- **mockEmptyProfile**: Minimal profile for testing empty states
- **createMockUserProfile()**: Factory function for custom profiles

### Activity History Test Data
- **mockActivityEntries**: Array of various activity types
- **createMockActivityEntry()**: Factory for custom activities

### File Upload Test Data
- **createMockFile()**: Helper for file upload testing
- File type validation scenarios
- File size validation scenarios

## Best Practices

### 1. Test Organization
- Group related tests using `describe()` blocks
- Use descriptive test names that explain the scenario
- Follow Arrange-Act-Assert pattern

### 2. Async Testing
- Always use `await` with async operations
- Use `waitFor()` for dynamic content
- Prefer user events over direct DOM manipulation

### 3. Mock Management
- Reset mocks between tests in `beforeEach()`
- Use MSW for API mocking over fetch mocks
- Mock external dependencies, not internal code

### 4. Accessibility Testing
- Include keyboard navigation tests
- Verify ARIA labels and roles
- Test screen reader compatibility

### 5. Error Scenario Testing
- Test validation errors for all forms
- Test network failure scenarios
- Test edge cases and boundary conditions

## Debugging Tests

### Debugging Unit Tests
```bash
# Run specific test file
npm run test ProfileInfoForm.test.tsx

# Debug with VS Code
# Add breakpoint and run "Debug Current Test File"

# View test output in browser
npm run test:ui
```

### Debugging E2E Tests
```bash
# Run in debug mode
npm run test:e2e:debug

# Run specific test
npx playwright test --grep "should update profile"

# View test results
npx playwright show-report
```

### Common Issues

1. **Test Timeouts**: Increase timeout for slow operations
2. **Element Not Found**: Wait for elements with `waitFor()`
3. **Mock Not Working**: Verify MSW server is running
4. **E2E Flakiness**: Add proper wait conditions

## Performance Testing

### Metrics Monitored
- Component render time
- Form submission response time
- Page load performance
- Memory usage patterns

### Performance Tests
```typescript
test('renders profile data efficiently', async () => {
  const startTime = performance.now();
  render(<ProfilePage />);
  await waitFor(() => screen.getByText(mockProfile.name));
  const renderTime = performance.now() - startTime;
  
  expect(renderTime).toBeLessThan(1000); // 1 second max
});
```

## Security Testing

### Areas Covered
- Input validation and sanitization
- CSRF protection verification
- Authentication requirement checks
- Authorization boundary testing
- File upload security validation

### Example Security Tests
```typescript
test('validates file upload security', async () => {
  const maliciousFile = createMockFile('script.js', 1024, 'application/javascript');
  // Test that non-image files are rejected
  expect(uploadValidation(maliciousFile)).toBe(false);
});
```

## Continuous Integration

### Pipeline Stages
1. **Fast Feedback**: Unit tests run on every push
2. **Integration**: API tests with database
3. **E2E**: Full workflow tests across browsers
4. **Quality Gates**: Coverage and security checks

### Failure Handling
- Tests must pass to merge PRs
- Coverage drops block deployment
- Security vulnerabilities fail builds
- E2E failures in critical paths block releases

## Maintenance

### Regular Tasks
- Update test fixtures when API changes
- Refresh mock data to match production
- Review and update coverage targets
- Maintain browser compatibility in E2E tests

### Monitoring
- Track test execution time trends
- Monitor flaky test patterns
- Review coverage reports weekly
- Update dependencies monthly

This comprehensive testing strategy ensures reliable, maintainable code with high confidence in the User Profile Management feature's functionality across all user interaction patterns.