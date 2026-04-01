# NPM Publishing & Build Guide

## Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0
- Git (for repository)

## Installation

### Option 1: Via Git Submodule (Current Method)
```bash
git submodule add https://github.com/wusxo24/ui5-excel-import webapp/lib/excelImport
```

### Option 2: Via npm (Recommended for future)
```bash
npm install ui5-excel-import
```

## Setup for Development

### 1. Clone Repository
```bash
git clone https://github.com/wusxo24/ui5-excel-import.git
cd ui5-excel-import
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### 4. Code Quality
```bash
# Check code with ESLint
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

### 5. Build & Pre-publish Checks
```bash
npm run build
```

## Project Structure

```
ui5-excel-import/
├── src/
│   └── your/lib/excelImport/
│       ├── ExcelImportFacade.js      # Main facade API
│       ├── ExcelReader.js             # Excel file reading
│       ├── ColumnDetector.js          # Column mapping
│       ├── BatchProcessor.js          # Data batching
│       └── ApiClient.js               # HTTP client
├── lib/
│   └── xlsx/
│       └── xlsx.bundle.js             # XLSX library
├── template/
│   ├── ColumnConfig.js                # Example column config
│   └── PayloadMapper.js               # Example data mapper
├── test/
│   ├── setup.js                       # Test environment setup
│   ├── *.test.js                      # Test files
│   └── .eslintrc.json                 # Test ESLint config
├── jest.config.js                     # Jest configuration
├── .eslintrc.json                     # Root ESLint configuration
├── package.json
├── ui5.yaml
├── README.md
└── LIBRARY_EVALUATION.md
```

## Development Workflow

### Making Changes
1. Update source files in `src/`
2. Run tests: `npm test`
3. Fix linting: `npm run lint:fix`
4. Update template examples if needed: `template/`
5. Submit PR with test coverage

### Testing Requirements
- Minimum 80% code coverage
- All public APIs must have tests
- Error cases must be tested
- JSDoc examples must be accurate

## npm Publishing

### First Time Publishing

1. **Create npm Account**
   ```bash
   npm adduser
   ```

2. **Update Version in package.json**
   ```bash
   npm version major|minor|patch
   ```

3. **Publish**
   ```bash
   npm publish
   ```

### Subsequent Releases

1. **Make Changes & Test**
   ```bash
   npm run build
   ```

2. **Update Version**
   ```bash
   npm version patch  # or minor/major
   ```

3. **Publish**
   ```bash
   npm publish
   ```

## Continuous Integration

Recommended CI/CD steps:
1. Install dependencies
2. Run `npm run lint`
3. Run `npm run test:coverage`
4. Publish to npm on tag

### Example GitHub Actions Workflow

See `.github/workflows/npm-publish.yml` for CI/CD setup.

## Version Management

Follow Semantic Versioning (SemVer):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

Example versions:
- `1.0.0` - First release
- `1.1.0` - New features added
- `1.1.1` - Bug fixes
- `2.0.0` - Breaking changes

## Dependencies

### Production
- No external dependencies (XLSX bundled)

### Development
- jest: ^29.0.0 - Testing framework
- eslint: ^8.0.0 - Code quality
- @ui5/cli: ^3.0.0 - UI5 build tools

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `npm test` | Run all unit tests |
| `npm run test:watch` | Watch mode for tests |
| `npm run test:coverage` | Generate coverage report |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run build` | Complete build & check |
| `npm publish` | Publish to npm registry |

## Troubleshooting

### Test Failures
```bash
npm run test:coverage  # Check what's not covered
npm run lint           # Fix any lint issues first
```

### npm Publish Errors
```bash
# Login to npm
npm login

# Check what will be published
npm pack    # Creates tarball to inspect

# Verify package contents
tar -tzf ui5-excel-import-1.0.0.tgz
```

### Issues with XLSX Library
- XLSX library is bundled in `lib/xlsx/`
- No need to install separately
- Works in browser environment only

## Migration from Git Submodule to npm

### Current Installation (Git Submodule)
```bash
git submodule add https://github.com/wusxo24/ui5-excel-import webapp/lib/excelImport
```

### Future Installation (npm)
```bash
npm install ui5-excel-import
# Then import in your application
sap.ui.require(["ui5ExcelImport/ExcelImportFacade"], function(ExcelImport) {
  // Use ExcelImport
});
```

## Documentation

- **README.md** - Main documentation and usage examples
- **LIBRARY_EVALUATION.md** - Evaluation report and best practices
- **JSDoc Comments** - Available in source code
- **Templates** - See `template/` for configuration examples

## Support

For issues or questions:
- GitHub Issues: https://github.com/wusxo24/ui5-excel-import/issues
- Check LIBRARY_EVALUATION.md for common patterns
- Review test files for usage examples

## License

MIT - See LICENSE file for details

## Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/xyz`
3. Make changes and test: `npm run build`
4. Submit pull request

## Changelog

See CHANGELOG.md for version history and updates.
