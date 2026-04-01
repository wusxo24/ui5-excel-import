# UI5 Excel Import Library

Production-ready, reusable Excel import library for SAP UI5 applications.

**Status**: ✅ Fully tested and validated | 🛡️ Comprehensive error handling | 📊 80%+ code coverage

## Features

- ✅ **Robust Excel Parsing** - Full validation and error handling
- ✅ **Column Mapping** - Flexible alias-based column detection  
- ✅ **Batch Processing** - Efficient handling of large datasets
- ✅ **Error Handling** - Comprehensive error messages and validation
- ✅ **Type Safe** - Full JSDoc documentation
- ✅ **Well Tested** - 80%+ code coverage with Jest
- ✅ **Zero External Dependencies** - XLSX library bundled

## Quick Start

### Installation

#### Option 1: Git Submodule (Current)
```bash
git submodule add https://github.com/wusxo24/ui5-excel-import webapp/lib/excelImport
```

#### Option 2: npm (Coming Soon)
```bash
npm install ui5-excel-import
```

### Basic Usage

```javascript
sap.ui.define([
  "your/lib/excelImport/ExcelImportFacade"
], function (ExcelImport) {
  "use strict";

  // Parse Excel file
  const result = await ExcelImport.parseOnly({
    file: excelFile,
    columns: {
      companyCode: ["Company Code", "Bukrs"],
      account: ["Account", "HKONT"],
      amount: ["Amount", "WRBTR"],
      currency: ["Currency", "WAERS"]
    }
  });

  if (result.errors.length > 0) {
    console.error("Parse errors:", result.errors);
  } else {
    console.log(`Processed ${result.rowsProcessed} rows`);
    console.log(result.data);
  }
});
```

### Advanced: Parse and Post

```javascript
// Complete workflow: parse, transform, and post data
const responses = await ExcelImport.parseAndPost({
  file: excelFile,
  columns: ColumnConfig,
  mapper: PayloadMapper,
  uploadUrl: "/api/import",
  fileName: "employees.xlsx",
  testMode: false,
  batchSize: 50
});

responses.forEach((response, index) => {
  console.log(`Batch ${index + 1}:`, response);
});
```

## API Reference

### ExcelImportFacade

#### `parseOnly(options)`

Parses Excel file and maps columns without posting data.

**Parameters:**
- `options.file` (File): Excel file to parse [required]
- `options.columns` (Object): Column mapping configuration [required]

**Returns:** 
```javascript
{
  data: Array<Object>,        // Parsed and mapped rows
  errors: Array<String>,      // Error messages
  rowsProcessed: Number       // Total rows processed
}
```

**Example:**
```javascript
const result = await ExcelImport.parseOnly({
  file: fileInput.files[0],
  columns: {
    companyCode: ["Company Code", "Bukrs"],
    account: ["Account", "HKONT"]
  }
});
```

#### `parseAndPost(options)`

Parses Excel, transforms data, and posts in batches.

**Parameters:**
- `options.file` (File): Excel file [required]
- `options.columns` (Object): Column mapping [required]
- `options.mapper` (Object): Object with `map()` function [required]
- `options.uploadUrl` (String): API endpoint [required]
- `options.fileName` (String): File name for request [required]
- `options.testMode` (Boolean): Test mode flag (optional, default: false)
- `options.batchSize` (Number): Items per batch (optional, default: 50)

**Returns:** `Promise<Array<Object>>` - API responses for each batch

**Example:**
```javascript
const responses = await ExcelImport.parseAndPost({
  file: excelFile,
  columns: config,
  mapper: {
    map: (data) => data.map(row => ({
      bukrs: row.companyCode,
      hkont: row.account,
      wrbtr: row.amount
    }))
  },
  uploadUrl: "/api/import",
  fileName: "data.xlsx",
  batchSize: 100
});
```

## Configuration

### Column Mapping (ColumnConfig)

Maps Excel columns to internal field names using aliases.

```javascript
// template/ColumnConfig.js
sap.ui.define([], function () {
  return {
    // Field name: [possible column headers]
    companyCode: ["Company Code", "Bukrs", "Company"],
    account: ["Account", "HKONT", "Acct"],
    amount: ["Amount", "WRBTR", "Sum"],
    currency: ["Currency", "WAERS", "Curr"]
  };
});
```

### Data Mapper (PayloadMapper)

Transforms mapped rows to API payload format.

```javascript
// template/PayloadMapper.js
sap.ui.define([], function () {
  return {
    map: function(data) {
      return data.map(row => ({
        bukrs: row.companyCode,
        hkont: row.account,
        wrbtr: row.amount,
        waers: row.currency
      }));
    }
  };
});
```

## Error Handling

The library provides comprehensive error messages:

```javascript
try {
  const result = await ExcelImport.parseOnly({
    file: null,
    columns: {}
  });
} catch (error) {
  // Error: "File is required for parseOnly operation"
  // Error: "Column configuration cannot be empty"
  console.error(error.message);
}
```

Common errors:
- `File is required` - No file provided
- `Column configuration is required` - Column config missing
- `File must be an Excel file` - Invalid file format
- `Excel sheet is empty` - No data in sheet
- `Upload URL must be a non-empty string` - Invalid URL
- `Request timeout after 30000ms` - API timeout

## Architecture

### Module Breakdown

| Module | Purpose |
|--------|---------|
| **ExcelImportFacade** | Main public API (parseOnly, parseAndPost, postOnly) |
| **ExcelReader** | Reads and parses Excel files with validation |
| **ColumnDetector** | Maps Excel columns based on configuration |
| **BatchProcessor** | Splits data into batches for processing |
| **ApiClient** | HTTP POST client with timeout handling |

### Module Dependencies

```
ExcelImportFacade
├── ExcelReader (reads Excel files)
├── ColumnDetector (detects columns)
├── BatchProcessor (creates batches)
└── ApiClient (posts data)
```

## Testing

### Run Tests
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Coverage
Current coverage: **80%+**
- ExcelReader: Full validation & error handling
- ColumnDetector: Column mapping & validation
- BatchProcessor: Batch logic & edge cases
- ApiClient: Request & timeout handling
- ExcelImportFacade: Complete workflows

### Test Files
- `test/ExcelReader.test.js` - File validation and parsing
- `test/ColumnDetector.test.js` - Column mapping
- `test/BatchProcessor.test.js` - Batch creation
- `test/ApiClient.test.js` - HTTP client
- `test/ExcelImportFacade.test.js` - Main API

## Development

### Code Quality
```bash
npm run lint               # ESLint check
npm run lint:fix          # Auto-fix issues
npm run build             # Full build & test
```

### Requirements
- Node.js >= 14.0.0
- npm >= 6.0.0

### Project Structure
```
ui5-excel-import/
├── src/your/lib/excelImport/  # Source modules
├── lib/xlsx/                   # XLSX library
├── template/                   # Config templates
├── test/                       # Test files
├── BUILD_AND_NPM_GUIDE.md      # Publishing guide
└── LIBRARY_EVALUATION.md       # Architecture docs
```

## Browser Support

- Chrome 89+
- Firefox 86+
- Safari 14+
- Edge 89+

**Requirements:**
- FileReader API
- Promise support
- Fetch API
- AbortController (for timeouts)

## Deprecations

### `postOnly()` - Deprecated

Use `parseAndPost()` instead for complete workflow:

```javascript
// ❌ OLD WAY
await ExcelImport.postOnly({
  data: parsedData,
  mapper: PayloadMapper,
  uploadUrl: "/api/import",
  fileName: "data.xlsx",
  testMode: false
});

// ✅ NEW WAY
await ExcelImport.parseAndPost({
  file: excelFile,
  columns: ColumnConfig,
  mapper: PayloadMapper,
  uploadUrl: "/api/import",
  fileName: "data.xlsx",
  testMode: false
});
```

## Documentation

- **BUILD_AND_NPM_GUIDE.md** - Build, test, and publish guide
- **LIBRARY_EVALUATION.md** - Architecture and design patterns
- **JSDoc Comments** - Inline documentation in source code

## Examples

### Complete Import Workflow

```javascript
sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "your/lib/excelImport/ExcelImportFacade",
  "your/template/ColumnConfig",
  "your/template/PayloadMapper"
], function (Controller, ExcelImport, ColumnConfig, PayloadMapper) {
  "use strict";

  return Controller.extend("your.app.controller.Import", {
    onImportPress: async function () {
      try {
        // Get file from input
        const file = document.getElementById("fileInput").files[0];

        // Upload to API
        const responses = await ExcelImport.parseAndPost({
          file: file,
          columns: ColumnConfig,
          mapper: PayloadMapper,
          uploadUrl: "/odata/import",
          fileName: file.name,
          testMode: false,
          batchSize: 50
        });

        // Handle responses
        const successCount = responses.filter(r => r.success).length;
        this.showMessage(`${successCount}/${responses.length} batches processed`);
      } catch (error) {
        this.showError(error.message);
      }
    }
  });
});
```

## Troubleshooting

### Excel File Not Recognized
- Verify file has .xlsx extension
- Check MIME type includes "spreadsheet"
- Try exporting as .xlsx from Excel

### Column Not Detected
- Check aliases match Excel headers exactly (case-sensitive for aliases check)
- Verify column configuration has array of aliases
- Review warnings in console

### Timeout Errors
- Increase `timeout` parameter
- Check API server performance
- Verify network connectivity
- Consider reducing batch size

### Memory Issues with Large Files
- Use smaller batch size (e.g., 25 instead of 50)
- Process files sequentially
- Monitor browser memory usage

## Performance Tips

1. **Batch Size** - Test different sizes for your API:
   ```javascript
   // Smaller batches = more requests but less memory
   batchSize: 25   // For large files
   batchSize: 100  // For small files
   ```

2. **Timeout Configuration**:
   ```javascript
   // Adjustable per API performance
   await Api.post(url, data, 60000);  // 60 second timeout
   ```

3. **File Size** - Recommended max 10,000 rows per file

## Version History

### v1.0.0 (Current)
- ✅ Comprehensive error handling
- ✅ Full JSDoc documentation
- ✅ 80%+ test coverage
- ✅ Production-ready
- ✨ New `parseAndPost()` method
- ⚠️ Deprecated `postOnly()` method

## License

MIT - See LICENSE file

## Support & Contributing

**Issues:** https://github.com/wusxo24/ui5-excel-import/issues

**Contributing:**
1. Fork the repository
2. Create feature branch
3. Run tests: `npm run build`
4. Submit pull request

## Related Documentation

- [Excel Parsing Concepts](./docs/parsing.md)
- [Column Mapping Guide](./docs/column-mapping.md)
- [API Integration](./docs/api-integration.md)
- [Error Handling Strategies](./docs/error-handling.md)
