# Roadmap: v1.2.0 - Optional XLSX Loading & Field Validation

**Target Release:** Q2 2026  
**Priority:** High ⚠️ (Addresses double-bundling issue from enterprise users)

## Problem Statement

Current v1.1.0 bundles XLSX (~1.3 MB) by default. Enterprise projects often already have:
- SAP UI5 projects with SheetJS
- Finance apps with XLSX (like the FI Document Posting example)
- Custom Excel utilities

**Result:** Double bundling wastes ~340 KB when users already have XLSX

## Goals

✅ Make XLSX loading optional and injectable  
✅ Reduce bundle size for users with existing XLSX  
✅ Maintain backward compatibility  
✅ Add FieldValidator module  
✅ Improve enterprise usability

---

## Implementation Plan

### Phase 1: Optional XLSX Loading (Core)

#### 1.1 Modify ExcelReader to Accept Optional XLSX

**File:** `src/your/lib/excelImport/ExcelReader.js`

```javascript
sap.ui.define([], function () {
  "use strict";

  // Store injected XLSX or use bundled fallback
  let xlsxInstance = null;

  return {
    /**
     * Set the XLSX instance (for injection)
     * @param {Object} xlsxLib - SheetJS library instance
     */
    setXLSX(xlsxLib) {
      if (!xlsxLib || typeof xlsxLib.read !== "function") {
        throw new Error("Invalid XLSX instance provided");
      }
      xlsxInstance = xlsxLib;
    },

    /**
     * Get XLSX instance (fallback to bundled)
     * @returns {Object} XLSX instance
     * @throws {Error} If XLSX not available
     */
    _getXLSX() {
      if (xlsxInstance) {
        return xlsxInstance;
      }

      // Try to load bundled version
      try {
        // Dynamic import or fallback
        return window.XLSX;
      } catch (e) {
        throw new Error(
          "XLSX library not available. Call setXLSX() with your XLSX instance."
        );
      }
    },

    read(file) {
      // ... existing code ...
      const XLSX = this._getXLSX();
      const workbook = XLSX.read(data, { type: "binary" });
      // ... rest
    }
  };
});
```

#### 1.2 Modify ExcelImportFacade to Accept XLSX Config

**File:** `src/your/lib/excelImport/ExcelImportFacade.js`

```javascript
return {
  /**
   * Configure XLSX instance for the library
   * Call this once at app startup if using external XLSX
   * @param {Object} xlsxLib - SheetJS library instance
   */
  configureXLSX(xlsxLib) {
    ExcelReader.setXLSX(xlsxLib);
  },

  parseOnly(options) {
    // ... existing code ...
  }
  // ... rest
};
```

#### 1.3 Update Usage Documentation

**In README.md:**

```javascript
// Option A: Using external XLSX (recommended if you already have it)
import ExcelImport from "ui5-excel-import";
import XLSX from "xlsx"; // Your existing XLSX

ExcelImport.configureXLSX(XLSX);

// Then use normally - no bundled version loaded
await ExcelImport.parseOnly({ file, columns });

// Option B: Using bundled XLSX (default)
// No configuration needed, uses library's bundled version
await ExcelImport.parseOnly({ file, columns });
```

---

### Phase 2: FieldValidator Module

#### 2.1 Create FieldValidator.js

**File:** `src/your/lib/excelImport/FieldValidator.js`

```javascript
sap.ui.define([], function () {
  "use strict";

  /**
   * Field-level validation and transformation
   * @namespace your.lib.excelImport.FieldValidator
   */
  return {
    /**
     * Validate a single field value
     * @param {Any} value - Field value
     * @param {Object} rules - Validation rules { type, required, pattern, min, max, transform }
     * @returns {Object} { valid: boolean, value: transformed value, error: message }
     */
    validateField(value, rules) {
      if (!rules) {
        return { valid: true, value: value };
      }

      // Required check
      if (rules.required && (value === null || value === undefined || value === "")) {
        return {
          valid: false,
          error: rules.requiredMessage || "Field is required"
        };
      }

      // Type validation
      if (rules.type && typeof value !== rules.type) {
        return {
          valid: false,
          error: `Expected ${rules.type}, got ${typeof value}`
        };
      }

      // Pattern validation (regex)
      if (rules.pattern && !rules.pattern.test(String(value))) {
        return {
          valid: false,
          error: rules.patternMessage || "Invalid format"
        };
      }

      // Min/Max validation
      if (rules.min !== undefined && value < rules.min) {
        return {
          valid: false,
          error: `Value must be at least ${rules.min}`
        };
      }

      if (rules.max !== undefined && value > rules.max) {
        return {
          valid: false,
          error: `Value must not exceed ${rules.max}`
        };
      }

      // Custom validator
      if (rules.validate && typeof rules.validate === "function") {
        const customResult = rules.validate(value);
        if (customResult !== true) {
          return {
            valid: false,
            error: typeof customResult === "string" ? customResult : "Validation failed"
          };
        }
      }

      // Transform
      let finalValue = value;
      if (rules.transform && typeof rules.transform === "function") {
        finalValue = rules.transform(value);
      }

      return { valid: true, value: finalValue };
    },

    /**
     * Validate entire row against schema
     * @param {Object} row - Row data
     * @param {Object} schema - Field validation rules { fieldName: rules }
     * @returns {Object} { valid: boolean, data: validated row, errors: error list }
     */
    validateRow(row, schema) {
      const validatedRow = { ...row };
      const errors = [];

      for (const [field, rules] of Object.entries(schema)) {
        const result = this.validateField(row[field], rules);
        if (!result.valid) {
          errors.push({ field, error: result.error });
        } else {
          validatedRow[field] = result.value;
        }
      }

      return {
        valid: errors.length === 0,
        data: validatedRow,
        errors: errors
      };
    }
  };
});
```

#### 2.2 Integration with ExcelImportFacade

```javascript
// Usage example
const result = await ExcelImport.parseOnly({ file, columns });

// Then validate with schema
const validationSchema = {
  documentDate: {
    required: true,
    pattern: /^\d{2}\/\d{2}\/\d{4}$/,
    transform: (val) => val.split("/").reverse().join("")
  },
  amount: {
    type: "number",
    min: 0,
    max: 999999999
  },
  account: {
    required: true,
    validate: (val) => val.length >= 4 || "Account must be 4+ chars"
  }
};

const validatedRows = [];
for (const row of result.data) {
  const validation = FieldValidator.validateRow(row, validationSchema);
  if (!validation.valid) {
    result.errors.push(...validation.errors);
  } else {
    validatedRows.push(validation.data);
  }
}
```

---

### Phase 3: Package Configuration

#### 3.1 Update package.json

```json
{
  "version": "1.2.0",
  "exports": {
    ".": {
      "import": "./src/your/lib/excelImport/ExcelImportFacade.js",
      "require": "./src/your/lib/excelImport/ExcelImportFacade.js"
    },
    "./no-xlsx": {
      "import": "./src/your/lib/excelImport/ExcelImportFacade.js"
    }
  }
}
```

#### 3.2 Create Build Variations

Support tree-shaking to exclude XLSX:
```bash
# Full build with XLSX
npm run build

# Build without XLSX for external use
npm run build:no-xlsx
```

---

### Phase 4: Testing

Add tests for:
- XLSX injection
- Missing XLSX error handling
- FieldValidator rules validation
- Custom validators
- Transform functions

```javascript
// Test: Should allow external XLSX injection
describe("ExcelImportFacade - XLSX Injection", () => {
  it("should use injected XLSX", () => {
    const mockXLSX = { read: jest.fn() };
    ExcelImport.configureXLSX(mockXLSX);
    expect(ExcelReader._getXLSX()).toBe(mockXLSX);
  });

  it("should throw when XLSX not available", () => {
    ExcelReader.setXLSX(null);
    expect(() => ExcelImport.parseOnly({...})).toThrow();
  });
});
```

---

## Benefits

| Benefit | Impact |
|---------|--------|
| **Bundle Size** | Reduce from 390 KB → 50 KB for users with XLSX |
| **Enterprise Ready** | Eliminates double-bundling issues |
| **Flexibility** | Users can inject their own XLSX version |
| **Validation** | Built-in field validation module |
| **Backward Compatible** | v1.1.0 code works unchanged |

---

## Testing Checklist

- [ ] Unit tests for XLSX injection (100% coverage)
- [ ] Field validation tests (all rules)
- [ ] Integration tests with external XLSX
- [ ] Build size verification (with/without XLSX)
- [ ] Backward compatibility tests
- [ ] Performance benchmarks

---

## Documentation

- [ ] Update README with XLSX configuration options
- [ ] Add FieldValidator documentation & examples
- [ ] Create migration guide (v1.1.0 → v1.2.0)
- [ ] Update API reference
- [ ] Create troubleshooting guide for bundling issues

---

## Deliverables

1. **Code:**
   - Optional XLSX loading
   - FieldValidator module
   - Updated ExcelImportFacade
   - Test suite for new features

2. **Documentation:**
   - README updates
   - API documentation
   - Migration guide

3. **Build Artifacts:**
   - npm package v1.2.0
   - Build with XLSX
   - Build without XLSX (separate export)

---

## Success Criteria

✅ Users with existing XLSX can exclude library's bundle  
✅ Bundle size reduced by ~340 KB for option above  
✅ FieldValidator provides comprehensive validation  
✅ 100% test coverage for new code  
✅ Zero breaking changes from v1.1.0  
✅ Documentation complete with examples

---

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Optional XLSX | 2-3 days | Planned |
| Phase 2: FieldValidator | 2-3 days | Planned |
| Phase 3: Configuration | 1-2 days | Planned |
| Phase 4: Testing | 2-3 days | Planned |
| **Total** | **~2 weeks** | **Planned** |
