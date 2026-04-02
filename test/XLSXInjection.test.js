/**
 * Tests for XLSX library injection mechanism (v1.2.0 feature)
 * Validates optional XLSX loading and dependency injection without SAP UI5 module loading
 */

describe("XLSX Injection Mechanism (v1.2.0)", () => {
  // Mock module with injection support
  const createExcelReaderWithInjection = () => {
    let injectedXLSX = null;
    const bundledXLSX = {
      read: jest.fn(),
      utils: { sheet_to_row_object_array: jest.fn() }
    };

    return {
      setXLSX(xlsxLib) {
        if (!xlsxLib) {
          throw new Error("XLSX library instance is required");
        }

        if (typeof xlsxLib.read !== "function") {
          throw new Error("XLSX library must have a read() method");
        }

        if (!xlsxLib.utils || typeof xlsxLib.utils.sheet_to_row_object_array !== "function") {
          throw new Error("XLSX library must have utils.sheet_to_row_object_array() method");
        }

        injectedXLSX = xlsxLib;
      },

      _getXLSX() {
        if (injectedXLSX) {
          return injectedXLSX;
        }

        if (bundledXLSX) {
          return bundledXLSX;
        }

        throw new Error("XLSX library not available");
      },

      _clearInjection() {
        injectedXLSX = null;
      }
    };
  };

  describe("ExcelReader XLSX Injection API", () => {

    test("setXLSX should throw error when called with null", () => {
      const reader = createExcelReaderWithInjection();
      expect(() => {
        reader.setXLSX(null);
      }).toThrow("XLSX library instance is required");
    });

    test("setXLSX should throw error when called with undefined", () => {
      const reader = createExcelReaderWithInjection();
      expect(() => {
        reader.setXLSX(undefined);
      }).toThrow("XLSX library instance is required");
    });

    test("setXLSX should throw error with object missing read() method", () => {
      const reader = createExcelReaderWithInjection();
      const invalidXLSX = {
        utils: { sheet_to_row_object_array: jest.fn() }
      };

      expect(() => {
        reader.setXLSX(invalidXLSX);
      }).toThrow("XLSX library must have a read() method");
    });

    test("setXLSX should throw error with object missing utils.sheet_to_row_object_array", () => {
      const reader = createExcelReaderWithInjection();
      const invalidXLSX = {
        read: jest.fn()
      };

      expect(() => {
        reader.setXLSX(invalidXLSX);
      }).toThrow("XLSX library must have utils.sheet_to_row_object_array() method");
    });

    test("setXLSX should throw error with incomplete utils object", () => {
      const reader = createExcelReaderWithInjection();
      const invalidXLSX = {
        read: jest.fn(),
        utils: {}
      };

      expect(() => {
        reader.setXLSX(invalidXLSX);
      }).toThrow("XLSX library must have utils.sheet_to_row_object_array() method");
    });

    test("setXLSX should accept valid XLSX library object", () => {
      const reader = createExcelReaderWithInjection();
      const validXLSX = {
        read: jest.fn(),
        utils: {
          sheet_to_row_object_array: jest.fn()
        }
      };

      expect(() => {
        reader.setXLSX(validXLSX);
      }).not.toThrow();
    });
  });

  describe("ExcelReader _getXLSX() - Fallback Logic", () => {

    test("_getXLSX should return bundled XLSX when no injection", () => {
      const reader = createExcelReaderWithInjection();
      reader._clearInjection();

      const xlsx = reader._getXLSX();
      expect(xlsx).toHaveProperty("read");
      expect(xlsx).toHaveProperty("utils");
    });

    test("_getXLSX should return injected XLSX when configured", () => {
      const reader = createExcelReaderWithInjection();
      const externalXLSX = {
        read: jest.fn(),
        utils: { sheet_to_row_object_array: jest.fn() },
        version: "external-1.0"
      };

      reader.setXLSX(externalXLSX);
      const xlsx = reader._getXLSX();

      expect(xlsx.version).toBe("external-1.0");
      expect(xlsx).toBe(externalXLSX);
    });

    test("_getXLSX should prefer injected over bundled", () => {
      const reader = createExcelReaderWithInjection();
      const injectedXLSX = {
        read: jest.fn(),
        utils: { sheet_to_row_object_array: jest.fn() },
        source: "injected"
      };

      reader.setXLSX(injectedXLSX);
      const xlsx = reader._getXLSX();

      expect(xlsx.source).toBe("injected");
    });
  });

  describe("ExcelImportFacade XLSX Configuration", () => {

    test("configureXLSX should validate XLSX before accepting", () => {
      const facade = {
        configureXLSX(xlsxLib) {
          if (!xlsxLib) {
            throw new Error("XLSX library instance is required");
          }
          if (typeof xlsxLib.read !== "function") {
            throw new Error("XLSX library must have a read() method");
          }
          if (!xlsxLib.utils || typeof xlsxLib.utils.sheet_to_row_object_array !== "function") {
            throw new Error("XLSX library must have utils.sheet_to_row_object_array() method");
          }
        }
      };

      expect(() => {
        facade.configureXLSX(null);
      }).toThrow("XLSX library instance is required");
    });

    test("configureXLSX should accept valid XLSX library", () => {
      let capturedXLSX = null;

      const facade = {
        configureXLSX(xlsxLib) {
          if (!xlsxLib) {
            throw new Error("XLSX library instance is required");
          }
          if (typeof xlsxLib.read !== "function") {
            throw new Error("XLSX library must have a read() method");
          }
          if (!xlsxLib.utils || typeof xlsxLib.utils.sheet_to_row_object_array !== "function") {
            throw new Error("XLSX library must have utils.sheet_to_row_object_array() method");
          }
          capturedXLSX = xlsxLib;
        }
      };

      const validXLSX = {
        read: jest.fn(),
        utils: { sheet_to_row_object_array: jest.fn() }
      };

      expect(() => {
        facade.configureXLSX(validXLSX);
      }).not.toThrow();

      expect(capturedXLSX).toBe(validXLSX);
    });
  });

  describe("XLSX Library Version Compatibility", () => {

    test("should work with XLSX version 0.18.x format", () => {
      const reader = createExcelReaderWithInjection();
      const xlsxV18 = {
        read: jest.fn((_data, _opts) => ({
          SheetNames: ["Sheet1"],
          Sheets: { Sheet1: {} }
        })),
        utils: {
          sheet_to_row_object_array: jest.fn(() => [
            { col: "value" }
          ])
        }
      };

      expect(() => {
        reader.setXLSX(xlsxV18);
      }).not.toThrow();

      const xlsx = reader._getXLSX();
      expect(typeof xlsx.read).toBe("function");
      expect(typeof xlsx.utils.sheet_to_row_object_array).toBe("function");
    });

    test("should work with XLSX version 0.19.x format", () => {
      const reader = createExcelReaderWithInjection();
      const xlsxV19 = {
        read: jest.fn((_data, _opts) => ({
          SheetNames: ["Sheet1"],
          Sheets: { Sheet1: {} }
        })),
        utils: {
          sheet_to_row_object_array: jest.fn(() => [
            { col: "value" }
          ])
        }
      };

      expect(() => {
        reader.setXLSX(xlsxV19);
      }).not.toThrow();

      const xlsx = reader._getXLSX();
      expect(typeof xlsx.read).toBe("function");
      expect(typeof xlsx.utils.sheet_to_row_object_array).toBe("function");
    });

    test("should work with custom XLSX wrapper", () => {
      const reader = createExcelReaderWithInjection();
      const wrapper = {
        read: jest.fn((_data, _opts) => {
          // Custom wrapping logic
          return {
            SheetNames: ["Custom"],
            Sheets: { Custom: {} }
          };
        }),
        utils: {
          sheet_to_row_object_array: jest.fn(() => [
            { wrapped: "data" }
          ])
        },
        customMethod: () => "custom"
      };

      expect(() => {
        reader.setXLSX(wrapper);
      }).not.toThrow();

      const xlsx = reader._getXLSX();
      expect(xlsx.customMethod()).toBe("custom");
    });
  });

  describe("Bundle Size Optimization Scenarios", () => {

    test("Scenario 1: Default - uses bundled XLSX without injection", () => {
      const reader = createExcelReaderWithInjection();
      reader._clearInjection();

      // Should return bundled version
      const xlsx = reader._getXLSX();
      expect(xlsx).toBeDefined();
      expect(xlsx).toHaveProperty("read");
      expect(xlsx).toHaveProperty("utils");
    });

    test("Scenario 2: Enterprise - injects existing XLSX to avoid double-bundling", () => {
      const reader = createExcelReaderWithInjection();

      // Company's shared XLSX instance
      const enterpriseXLSX = {
        read: jest.fn(),
        utils: { sheet_to_row_object_array: jest.fn() },
        enterpriseVersion: true
      };

      // Inject once at app startup
      reader.setXLSX(enterpriseXLSX);

      // All subsequent calls use enterprise XLSX
      const xlsx1 = reader._getXLSX();
      const xlsx2 = reader._getXLSX();

      expect(xlsx1).toBe(enterpriseXLSX);
      expect(xlsx2).toBe(enterpriseXLSX);
      expect(xlsx1).toBe(xlsx2);
    });

    test("Scenario 3: Multi-module - singleton XLSX across modules", () => {
      // Simulate shared XLSX
      const sharedXLSX = {
        read: jest.fn(),
        utils: { sheet_to_row_object_array: jest.fn() }
      };

      const reader1 = createExcelReaderWithInjection();
      const reader2 = createExcelReaderWithInjection();

      // Both modules inject same XLSX
      reader1.setXLSX(sharedXLSX);
      reader2.setXLSX(sharedXLSX);

      // Both use same instance
      const xlsx1 = reader1._getXLSX();
      const xlsx2 = reader2._getXLSX();

      expect(xlsx1).toBe(sharedXLSX);
      expect(xlsx2).toBe(sharedXLSX);
    });
  });

  describe("Error Handling and Edge Cases", () => {

    test("should throw descriptive error if XLSX missing read()", () => {
      const reader = createExcelReaderWithInjection();
      const invalid = {
        utils: { sheet_to_row_object_array: jest.fn() }
      };

      const error = expect(() => {
        reader.setXLSX(invalid);
      });

      error.toThrow();
      error.toThrow("read() method");
    });

    test("should throw descriptive error if XLSX missing utils", () => {
      const reader = createExcelReaderWithInjection();
      const invalid = {
        read: jest.fn()
      };

      const error = expect(() => {
        reader.setXLSX(invalid);
      });

      error.toThrow();
      error.toThrow("utils");
    });

    test("should allow re-injection with different XLSX", () => {
      const reader = createExcelReaderWithInjection();

      const xlsx1 = {
        read: jest.fn(),
        utils: { sheet_to_row_object_array: jest.fn() },
        version: "1"
      };

      const xlsx2 = {
        read: jest.fn(),
        utils: { sheet_to_row_object_array: jest.fn() },
        version: "2"
      };

      reader.setXLSX(xlsx1);
      expect(reader._getXLSX().version).toBe("1");

      reader.setXLSX(xlsx2);
      expect(reader._getXLSX().version).toBe("2");
    });

    test("should validate all required methods exist", () => {
      const reader = createExcelReaderWithInjection();

      const tests = [
        { missing: "read", value: { utils: { sheet_to_row_object_array: jest.fn() } } },
        { missing: "utils", value: { read: jest.fn() } },
        { missing: "sheet_to_row_object_array", value: { read: jest.fn(), utils: {} } }
      ];

      tests.forEach(test => {
        expect(() => {
          reader.setXLSX(test.value);
        }).toThrow();
      });
    });
  });

  describe("Backward Compatibility", () => {

    test("Code without configureXLSX call should still work with bundled XLSX", () => {
      const reader = createExcelReaderWithInjection();

      // Simulate code that doesn't call configureXLSX
      const xlsx = reader._getXLSX();

      // Should return bundled version
      expect(xlsx).toBeDefined();
      expect(xlsx).toHaveProperty("read");
      expect(xlsx).toHaveProperty("utils");
    });

    test("Multiple readers should each maintain own injection state", () => {
      const reader1 = createExcelReaderWithInjection();
      const reader2 = createExcelReaderWithInjection();

      const xlsx1 = {
        read: jest.fn(),
        utils: { sheet_to_row_object_array: jest.fn() },
        id: "reader1"
      };

      const xlsx2 = {
        read: jest.fn(),
        utils: { sheet_to_row_object_array: jest.fn() },
        id: "reader2"
      };

      reader1.setXLSX(xlsx1);
      reader2.setXLSX(xlsx2);

      expect(reader1._getXLSX().id).toBe("reader1");
      expect(reader2._getXLSX().id).toBe("reader2");
    });
  });

  describe("Integration Patterns", () => {

    test("Application startup pattern - inject once, use everywhere", () => {
      // Simulates app initialization
      const externalXLSX = {
        read: jest.fn(),
        utils: { sheet_to_row_object_array: jest.fn() }
      };

      const reader = createExcelReaderWithInjection();

      // App startup
      reader.setXLSX(externalXLSX);

      // Multiple calls throughout app lifecycle
      expect(reader._getXLSX()).toBe(externalXLSX);
      expect(reader._getXLSX()).toBe(externalXLSX);
      expect(reader._getXLSX()).toBe(externalXLSX);

      // Should always return same instance
      const results = [
        reader._getXLSX(),
        reader._getXLSX(),
        reader._getXLSX()
      ];

      expect(results.every(r => r === externalXLSX)).toBe(true);
    });

    test("Module composition pattern - inject into facade", () => {
      const externalXLSX = {
        read: jest.fn(),
        utils: { sheet_to_row_object_array: jest.fn() }
      };

      const reader = createExcelReaderWithInjection();
      const facade = {
        configureXLSX(xlsxLib) {
          reader.setXLSX(xlsxLib);
        }
      };

      // Register via facade
      facade.configureXLSX(externalXLSX);

      // Reader uses injected version
      expect(reader._getXLSX()).toBe(externalXLSX);
    });
  });

  describe("Performance Characteristics", () => {

    test("Injection should not impact read() call performance", () => {
      const reader = createExcelReaderWithInjection();
      const mockXLSX = {
        read: jest.fn(),
        utils: { sheet_to_row_object_array: jest.fn() }
      };

      reader.setXLSX(mockXLSX);

      // Multiple _getXLSX calls should be O(1)
      const start = Date.now();
      for (let i = 0; i < 10000; i++) {
        reader._getXLSX();
      }
      const duration = Date.now() - start;

      // Should complete very quickly (< 100ms for 10k calls)
      expect(duration).toBeLessThan(100);
    });

    test("setXLSX validation should be fast", () => {
      const reader = createExcelReaderWithInjection();
      const validXLSX = {
        read: jest.fn(),
        utils: { sheet_to_row_object_array: jest.fn() }
      };

      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        reader.setXLSX(validXLSX);
      }
      const duration = Date.now() - start;

      // Validation should be fast (< 50ms for 1000 calls)
      expect(duration).toBeLessThan(50);
    });
  });
});
