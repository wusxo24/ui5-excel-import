# Enterprise Optimization Guide

**For:** Companies using SAP UI5 with existing Excel/XLSX tooling  
**Problem Solved:** Eliminate double-bundling waste (~340 KB)  
**Applies To:** v1.1.0+

---

## Quick Start: Three Optimization Paths

### Path 1: You DON'T Have Existing XLSX ✅ DEFAULT
**Recommendation:** Use library as-is

```javascript
// Just import and use - uses bundled XLSX
import ExcelImport from "ui5-excel-import";

const result = await ExcelImport.parseOnly({
  file: excelFile,
  columns: columnConfig
});
```

**Bundle Impact:** +390 KB (includes XLSX)  
**Setup Time:** 0 minutes

---

### Path 2: You HAVE XLSX via npm/Webpack 🎯 RECOMMENDED ⭐

**Recommended For:**
- Projects using `npm install xlsx`
- Webpack/Rollup builds with existing XLSX resolved
- Multi-module UI5 projects sharing XLSX

#### Configuration

**Option A: Webpack Alias**

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      // Redirect library's bundled XLSX to your existing one
      'your/lib/xlsx/xlsx.bundle': require.resolve('xlsx')
    }
  }
};
```

**Option B: UI5 Build Configuration**

```json
// .ui5rc.json or ui5.yaml
{
  "builder": {
    "customResourcePaths": {
      "your/lib/xlsx/xlsx.bundle.js": 
        "node_modules/xlsx/dist/xlsx.min.js"
    }
  }
}
```

**Option C: Runtime Injection (v1.2.0+)**

```javascript
import ExcelImport from "ui5-excel-import";
import XLSX from "xlsx";

// Inject your XLSX once at app startup
ExcelImport.configureXLSX(XLSX);

// Now all calls use your XLSX, not the bundled one
const result = await ExcelImport.parseOnly({
  file: excelFile,
  columns: columnConfig
});
```

**Bundle Impact:** -390 KB (excludes bundled XLSX)  
**Setup Time:** 5 minutes  
**Savings:** 340 KB in production build

---

### Path 3: You Have XLSX via SAP UI5 Library Reuse 🏢 ENTERPRISE

**Recommended For:**
- Company has SAP UI5 library with bundled XLSX
- Multiple projects sharing same XLSX
- Centralized dependency management

#### Configuration

```javascript
// Company framework library
sap.ui.define([
  "sap/mycompany/framework/ExcelSupport"  // Provides XLSX
], function(ExcelSupport) {
  "use strict";

  return {
    initialize: function() {
      // Import ui5-excel-import dynamically
      return new Promise((resolve) => {
        sap.ui.require(["ui5-excel-import"], function(ExcelImport) {
          // Inject company's XLSX
          ExcelImport.configureXLSX(ExcelSupport.XLSX);
          resolve();
        });
      });
    }
  };
});
```

**Bundle Impact:** -390 KB (no duplicate)  
**Setup Time:** 10-15 minutes  
**Savings:** 340 KB per consuming app × N apps

---

## Real-World Example: SAP Finance Integration

**Scenario:** Company already uses SAP UI5 5.x with `sap.ui.core.library` that includes XLSX for their finance document processor.

### Before (Double Bundling)
```
Finance App
├── XLSX (bundled in sap.ui.core) ... 390 KB
├── ExcelImport ........................ 390 KB ← DUPLICATE!
└── Total .............................. 780 KB waste
```

### After (Library Injection - Path 3)
```
Finance App
├── XLSX (in framework library) ........ 390 KB
├── ExcelImport (injected) ............ 50 KB (no XLSX)
└── Total .............................. 440 KB (-340 KB saved!) ✅
```

### Implementation Code

```javascript
// financeApp/controller/DocumentPosting.controller.js
sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "ui5-excel-import",
  "your/company/framework/ExcelLibrary"
], function(Controller, ExcelImport, ExcelLibrary) {
  "use strict";

  return Controller.extend("financeApp.controller.DocumentPosting", {
    onInit: function() {
      // Inject company's XLSX once
      if (!ExcelImport._configured) {
        ExcelImport.configureXLSX(ExcelLibrary.XLSX);
        ExcelImport._configured = true;
      }
    },

    onImportDocuments: function(oEvent) {
      const oFile = oEvent.getParameter("files")[0];

      ExcelImport.parseOnly({
        file: oFile,
        columns: {
          "Document Date": "documentDate",
          "Amount": "amount",
          "Account": "account",
          "Description": "description"
        }
      })
      .then((result) => {
        // Validate with FieldValidator (v1.2.0+)
        const validated = this._validateFinanceData(result.data);
        
        // Post to backend
        return ExcelImport.parseAndPost({
          file: oFile,
          columns: {...},
          url: "/api/finance/documents",
          batchSize: 100,
          ...
        });
      })
      .then(() => {
        this.showSuccessMessage("Documents imported successfully");
      })
      .catch((error) => {
        this.showErrorMessage(error.message);
      });
    },

    _validateFinanceData: function(rows) {
      // Reference: FieldValidator module (v1.2.0)
      // Implement field-level validation with business rules
      return rows.map(row => {
        // Validate amounts, dates, account codes, etc.
        return row;
      });
    }
  });
});
```

---

## Bundle Size Comparison

### Scenario 1: New Project (No Existing XLSX)

| Approach | XLSX | ExcelImport | Total | Wasted |
|----------|------|-------------|-------|--------|
| Use Default | 390 KB | 390 KB | 780 KB | - |

**Recommendation:** Use default (bundled)

---

### Scenario 2: Enterprise with Shared XLSX

| Approach | XLSX | ExcelImport | Total (App 1) | Total (App 1-5) | Wasted |
|----------|------|-------------|---------------|-----------------|--------|
| Double Bundle | 390 KB | 390 KB | 780 KB | 3,900 KB | 1,950 KB |
| **Inject** | 390 KB | 50 KB | **440 KB** | **2,390 KB** | **-1,510 KB saved!** ✅ |

**Recommendation:** Use injection (Path 3)

---

## Troubleshooting

### Issue: Bundle size is still 390 KB after injection

**Cause:** Webpack/build tool not tree-shaking bundled XLSX

**Solution:**
```javascript
// Check if bundled XLSX is still included
console.log(window.XLSX); // Should be undefined after injection

// If still defined, webpack config needs update
```

### Issue: "XLSX library not available" error

**Cause:** ExcelImport trying to use fallback bundled XLSX but injection not called

**Solution:**
```javascript
// Debug: Check if injection was applied
const ExcelImport = require("ui5-excel-import");
console.log(ExcelImport._xlsxInjected); // Should be true

// Fix: Call configureXLSX() earlier in app startup
ExcelImport.configureXLSX(XLSX);
```

### Issue: "Cannot find module 'xlsx'" after excluding bundle

**Cause:** Build config excludes bundled XLSX but didn't inject external one

**Solution:**
```javascript
// Add to your app initialization
import XLSX from "xlsx";
ExcelImport.configureXLSX(XLSX);
```

---

## Performance Tips

### 1. Lazy Load XLSX Only When Needed

```javascript
// Load XLSX only when Excel import feature accessed
const ExcelImport = await import("ui5-excel-import");
const XLSX = await import("xlsx");
ExcelImport.configureXLSX(XLSX);
```

### 2. Share XLSX Across Routes/Views

```javascript
// app/bootstrap.js - Initialize once
const ExcelImport = sap.ui.require("ui5-excel-import");
const XLSX = sap.ui.require("xlsx");
ExcelImport.configureXLSX(XLSX);

// All views can now use ExcelImport without re-injection
```

### 3. Monitor Bundle Size in Your Build

```bash
# Check production bundle size
npm run build
ls -lh dist/app.js

# Compare before/after injection
# Before: 1.2 MB
# After:  850 KB (-350 KB) ✅
```

---

## Migration Checklist

### For Existing v1.1.0 Users Upgrading to v1.2.0

- [ ] Review current bundle size
- [ ] Assess if you have existing XLSX
- [ ] Choose optimization path above (1, 2, or 3)
- [ ] Update build configuration (if Path 2 or 3)
- [ ] Run test build and verify size reduction
- [ ] Update app initialization code
- [ ] Test Excel import functionality
- [ ] Monitor production bundle in your CDN

---

## Support Matrix

| Feature | v1.1.0 | v1.2.0 |
|---------|--------|--------|
| Bundled XLSX (default) | ✅ | ✅ |
| Webpack alias injection | ⚠️ Manual | ✅ Supported |
| Runtime XLSX injection | ❌ | ✅ |
| FieldValidator | ❌ | ✅ |
| Tree-shaking support | ⚠️ Limited | ✅ Enhanced |

---

## FAQ

**Q: Does injection hurt performance?**  
A: No, it's a one-time call at startup. Actual Excel parsing uses same XLSX, no overhead.

**Q: Can I mix bundled and injected XLSX?**  
A: Not recommended. Choose one per application.

**Q: What if I don't care about 340 KB?**  
A: That's fine! Use default bundled version. Optimization is optional for lean deployments.

**Q: Will this break my current code?**  
A: No, v1.2.0 is fully backward compatible. Current code works unchanged.

**Q: How much faster is injection?**  
A: No speed difference. It's purely a size optimization for production builds.

---

## Next: Roadmap

**v1.2.0 (Coming Q2 2026)**
- ✅ Optional XLSX loading (this guide)
- ✅ Runtime XLSX injection API
- ✅ FieldValidator module
- ✅ Enhanced tree-shaking support

**v1.3.0+**
- Export to Excel (reverse direction)
- PDF export capability
- Streaming for 50K+ row datasets
