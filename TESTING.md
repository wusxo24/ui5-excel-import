# Testing Guide

Comprehensive guide for running, writing, and maintaining tests for the UI5 Excel Import library.

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode (reruns on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Structure

```
test/
├── setup.js                     # Jest environment setup
├── ExcelReader.test.js          # File reading tests
├── ColumnDetector.test.js       # Column mapping tests
├── BatchProcessor.test.js       # Batch logic tests
├── ApiClient.test.js            # HTTP client tests
├── ExcelImportFacade.test.js    # Main API tests
└── .eslintrc.json             # Test-specific linting
```

## Running Tests

### All Tests
```bash
npm test
```

Output:
```
PASS  test/ExcelReader.test.js
  ExcelReader Module
    _isExcelFile
      ✓ should accept .xlsx files
      ✓ should accept .xls files
      ...

Test Suites: 5 passed, 5 total
Tests:       68 passed, 68 total
Snapshots:   0 total
Time:        2.3s
```

### Watch Mode
```bash
npm run test:watch
```
Useful for development - reruns tests when files change.

### Coverage Report
```bash
npm run test:coverage
```

Generates:
- Console summary
- HTML report in `coverage/lcov-report/index.html`
- Text report showing uncovered lines

**Target Coverage:**
- Lines: 80%+
- Functions: 80%+
- Branches: 70%+
- Statements: 80%+

### Specific Test File
```bash
npm test ExcelReader.test.js
npm test -- --testPathPattern=ApiClient
```

### Run Single Test Suite
```bash
npm test -- --testNamePattern="ExcelReader"
```

## Test Categories

### 1. ExcelReader Tests (`test/ExcelReader.test.js`)

**What it tests:**
- File validation and type checking
- Excel file format detection
- Error handling for corrupted files
- FileReader API integration

**Test cases:**
```javascript
✓ should accept .xlsx files
✓ should accept .xls files
✓ should accept .csv files
✓ should reject non-excel files
✓ should handle corrupted Excel files
✓ should handle empty Excel sheets
✓ should handle file read errors
```

**Key validation:**
- File MIME type checking
- File extension verification
- Excel file structure validation

### 2. ColumnDetector Tests (`test/ColumnDetector.test.js`)

**What it tests:**
- Column mapping with aliases
- Configuration validation
- Error handling for invalid configs
- Null handling for missing columns

**Test cases:**
```javascript
✓ should map columns correctly
✓ should handle column aliases
✓ should return null for missing columns
✓ should throw error for invalid input
✓ should detect missing column aliases
```

**Coverage:**
- Alias matching logic
- Configuration structure validation
- Warning generation

### 3. BatchProcessor Tests (`test/BatchProcessor.test.js`)

**What it tests:**
- Batch creation with different sizes
- Edge cases (empty data, single batch)
- Input validation
- Integer validation for batch size

**Test cases:**
```javascript
✓ should create batches of correct size
✓ should handle single batch
✓ should handle empty array
✓ should handle batch size of 1
✓ should handle large batches (1000+ items)
✓ should throw error for invalid input
✓ should throw error for non-integer batch size
```

### 4. ApiClient Tests (`test/ApiClient.test.js`)

**What it tests:**
- HTTP POST requests
- Timeout handling
- Error responses (4xx, 5xx)
- Request validation
- Response content-type checking

**Test cases:**
```javascript
✓ should post data successfully
✓ should respect custom timeout
✓ should handle HTTP errors
✓ should reject if response is not JSON
✓ should throw error for empty URL
✓ should throw error for invalid timeout
```

### 5. ExcelImportFacade Tests (`test/ExcelImportFacade.test.js`)

**What it tests:**
- Main API methods (parseOnly, parseAndPost)
- Parameter validation
- Error handling and messages
- Batch metadata in requests
- Deprecation warnings

**Test cases:**
```javascript
✓ parseOnly requires file and columns
✓ parseAndPost validates all parameters
✓ postOnly logs deprecation warning
✓ Returns correct data and error structure
✓ Handles batch metadata correctly
```

## Writing New Tests

### Test Structure

```javascript
describe("Module Name", () => {
  
  beforeEach(() => {
    // Setup before each test
    jest.clearAllMocks();
  });

  describe("Feature", () => {
    
    it("should do something", () => {
      // Arrange: Set up test data
      const input = { test: "data" };
      
      // Act: Execute the function
      const result = myFunction(input);
      
      // Assert: Verify results
      expect(result).toEqual({ expected: "output" });
    });
  });
});
```

### Common Assertions

```javascript
// Equality
expect(value).toBe(5);                    // Strict equality
expect(value).toEqual({ a: 1 });         // Deep equality
expect(value).toStrictEqual({ a: 1 });   // Type + value

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();

// Numbers
expect(value).toBeGreaterThan(5);
expect(value).toBeLessThan(10);
expect(value).toHaveLength(3);

// Arrays
expect(array).toContain("element");
expect(array).toHaveLength(5);
expect(array).toEqual([1, 2, 3]);

// Errors
expect(() => {
  functionThatThrows();
}).toThrow("error message");

// Mocks
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
```

## Mocking

### Mock Fetch API

```javascript
global.fetch = jest.fn().mockResolvedValueOnce({
  ok: true,
  status: 200,
  json: async () => ({ success: true })
});
```

### Mock FileReader

```javascript
global.FileReader = class FileReader {
  readAsBinaryString(file) {
    // Mock implementation
  }
};
```

### Mock XLSX

```javascript
global.XLSX = {
  read: jest.fn(),
  utils: {
    sheet_to_row_object_array: jest.fn()
  }
};
```

## Coverage Goals

### Current Coverage

```
Statements   : 82% (expected 80%+)
Branches     : 75% (expected 70%+)
Functions    : 85% (expected 80%+)
Lines        : 82% (expected 80%+)
```

### Improving Coverage

1. **Identify uncovered lines:**
   ```bash
   npm run test:coverage
   # Open: coverage/lcov-report/index.html
   ```

2. **Add tests for uncovered code** in appropriate test file

3. **Re-run coverage** to verify improvement

### Recommended Minimum Coverage

- **Overall**: 80%
- **Critical paths**: 90%+
- **Error handlers**: 100%
- **Edge cases**: 100%

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '14'
      - run: npm install
      - run: npm run lint
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v2
        with:
          files: ./coverage/lcov.info
```

## Debugging Tests

### Debug Single Test

```bash
node --inspect-brk node_modules/.bin/jest --runInBand ExcelReader.test.js
```

### Add Logging

```javascript
it("should do something", () => {
  const result = myFunction(input);
  console.log("Result:", result);     // Logs during test
  expect(result).toBe(expected);
});
```

View logs:
```bash
npm test -- --verbose
```

### Pause Execution

```javascript
it("should do something", () => {
  debugger;  // Execution pauses here when using debug mode
  const result = myFunction(input);
  expect(result).toBe(expected);
});
```

## Best Practices

### 1. Clear Test Names
```javascript
// ❌ Bad
it("works", () => {});

// ✅ Good
it("should return mapped data when given valid column config", () => {});
```

### 2. Arrange-Act-Assert Pattern
```javascript
it("should map columns", () => {
  // Arrange
  const rows = [{ col: "value" }];
  
  // Act
  const result = detector.mapColumns(rows, config);
  
  // Assert
  expect(result).toHaveLength(1);
});
```

### 3. Test One Thing
```javascript
// ❌ Multiple assertions on different concerns
it("should work", () => {
  const result = fn(input);
  expect(result.a).toBe(1);
  expect(result.b).toBe(2);
  expect(result.c).toBe(3);
});

// ✅ Focused assertion
it("should return expected structure", () => {
  const result = fn(input);
  expect(result).toEqual({ a: 1, b: 2, c: 3 });
});
```

### 4. Test Error Cases
```javascript
it("should throw error for invalid input", () => {
  expect(() => {
    functionThatThrows(invalid);
  }).toThrow("expected message");
});
```

### 5. Use Descriptive Variables
```javascript
// ❌ Generic names
const d = { c: "code" };
const r = fn(d);

// ✅ Descriptive names
const companyRowData = { companyCode: "1000" };
const mappedResult = detector.mapColumns(companyRowData, config);
```

## Maintenance

### Update Tests When API Changes

If the API changes, update corresponding tests:

```javascript
// Before: old method signature
ExcelImport.postOnly({ data, mapper, uploadUrl });

// After: new method signature
ExcelImport.parseAndPost({ file, columns, mapper, uploadUrl });

// Update test too:
describe("Updated API", () => {
  it("should work with new parameters", () => {
    // ...
  });
});
```

### Keep Test Data Realistic

```javascript
// ❌ Unrealistic test data
const testRows = [{ a: 1 }, { a: 2 }];

// ✅ Realistic test data matching Excel output
const testRows = [
  { "Company Code": "1000", "Account": "1100", "Amount": "5000" },
  { "Company Code": "2000", "Account": "1200", "Amount": "3000" }
];
```

## Troubleshooting Tests

### Tests Fail Locally but Pass CI

1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear Jest cache: `npm test -- --clearCache`
3. Check Node version: `node --version`

### Mock Not Working

1. Ensure mock is created before import
2. Check `jest.clearAllMocks()` is in `beforeEach()`
3. Verify mock path matches actual module

### Timeout Errors

```bash
npm test -- --testTimeout=10000  # Increase timeout to 10s
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [Mocking in Jest](https://jestjs.io/docs/mock-functions)

## Continuous Improvement

1. Monitor coverage reports regularly
2. Add tests for bug fixes
3. Refactor tests when code changes
4. Keep test data realistic and maintainable
5. Document complex test scenarios
