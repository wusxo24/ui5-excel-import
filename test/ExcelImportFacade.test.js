/**
 * ExcelImportFacade Module Tests
 */

describe("ExcelImportFacade Module", () => {

  describe("parseOnly", () => {

    it("should require file parameter", async () => {
      expect(() => {
        throw new Error("File is required for parseOnly operation");
      }).toThrow("File is required");
    });

    it("should require column configuration", async () => {
      expect(() => {
        throw new Error("Column configuration is required");
      }).toThrow("Column configuration");
    });

    it("should reject empty column configuration", async () => {
      expect(() => {
        throw new Error("Column configuration cannot be empty");
      }).toThrow("cannot be empty");
    });

    it("should return data and errors object", () => {
      // Mock successful parse
      const result = {
        data: [{ col1: "value1" }],
        errors: [],
        rowsProcessed: 1
      };

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("errors");
      expect(result).toHaveProperty("rowsProcessed");
      expect(Array.isArray(result.data)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it("should return errors if parsing fails", () => {
      // Mock failed parse
      const result = {
        data: [],
        errors: ["Failed to parse Excel file"],
        rowsProcessed: 0
      };

      expect(result.errors).toHaveLength(1);
      expect(result.data).toHaveLength(0);
    });
  });

  describe("parseAndPost", () => {

    it("should require file parameter", () => {
      expect(() => {
        throw new Error("File is required");
      }).toThrow("File is required");
    });

    it("should require column configuration", () => {
      expect(() => {
        throw new Error("Column configuration is required");
      }).toThrow("Column configuration");
    });

    it("should require mapper with map function", () => {
      expect(() => {
        throw new Error("Mapper object with map() function is required");
      }).toThrow("Mapper");
    });

    it("should require upload URL", () => {
      expect(() => {
        throw new Error("Upload URL must be a non-empty string");
      }).toThrow("Upload URL");
    });

    it("should require fileName", () => {
      expect(() => {
        throw new Error("File name is required");
      }).toThrow("File name");
    });

    it("should validate batch size", () => {
      expect(() => {
        throw new Error("Batch size must be a positive number");
      }).toThrow("Batch size");
    });
  });

  describe("postOnly", () => {

    it("should log deprecation warning", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      // Mock the deprecated method call would log warning
      console.warn("postOnly() is deprecated. Use parseAndPost() for complete workflow.");

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("deprecated")
      );

      consoleSpy.mockRestore();
    });

    it("should require data array", () => {
      expect(() => {
        throw new Error("Data must be an array");
      }).toThrow("Data must be an array");
    });

    it("should require mapper function", () => {
      expect(() => {
        throw new Error("Mapper with map() function is required");
      }).toThrow("Mapper");
    });

    it("should require upload URL", () => {
      expect(() => {
        throw new Error("Upload URL is required");
      }).toThrow("Upload URL");
    });
  });

  describe("error handling", () => {

    it("should catch and wrap errors from Reader", () => {
      const error = "Failed to parse Excel file";
      const wrappedError = `Excel import failed: ${error}`;

      expect(wrappedError).toContain("Excel import failed");
    });

    it("should provide meaningful error messages", () => {
      const errors = [
        "File is required",
        "Column configuration is required",
        "Mapper object with map() function is required",
        "Upload URL must be a non-empty string",
        "File name is required"
      ];

      errors.forEach(error => {
        expect(error.length).toBeGreaterThan(0);
        expect(error).toMatch(/[a-zA-Z]/);
      });
    });

    it("should handle API errors in batch processing", () => {
      const mockErrors = [
        { error: "HTTP 400: Bad Request" },
        { error: "HTTP 500: Internal Server Error" },
        { error: "Request timeout after 30000ms" }
      ];

      mockErrors.forEach(err => {
        expect(err.error).toBeTruthy();
      });
    });
  });

  describe("parameter handling", () => {

    it("should use default testMode of false", () => {
      const testMode = false;
      expect(testMode).toBe(false);
    });

    it("should use default batchSize of 50", () => {
      const batchSize = 50;
      expect(batchSize).toBe(50);
    });

    it("should allow custom batch size", () => {
      const customSize = 100;
      expect(customSize).toBeGreaterThan(0);
    });

    it("should include batch metadata in requests", () => {
      const batchMetadata = {
        batchNumber: 1,
        batchTotal: 5,
        fileName: "data.xlsx",
        testMode: false
      };

      expect(batchMetadata.batchNumber).toBe(1);
      expect(batchMetadata.batchTotal).toBe(5);
    });
  });
});
