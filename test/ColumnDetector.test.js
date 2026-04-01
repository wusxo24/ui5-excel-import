/**
 * ColumnDetector Module Tests
 */

const ColumnDetectorModule = {
  _validateInput(rows, config) {
    return Array.isArray(rows) && typeof config === "object" && config !== null;
  },

  _validateConfig(config, firstRow) {
    const warnings = [];
    const availableColumns = Object.keys(firstRow);

    Object.keys(config).forEach(key => {
      const aliases = config[key];
      if (!Array.isArray(aliases) || aliases.length === 0) {
        warnings.push(`Column '${key}' has no aliases or is not an array`);
      } else {
        const hasMatch = aliases.some(alias => availableColumns.includes(alias));
        if (!hasMatch) {
          warnings.push(`Column '${key}' aliases [${aliases.join(", ")}] not found in Excel columns [${availableColumns.join(", ")}]`);
        }
      }
    });

    return warnings;
  },

  mapColumns(rows, config) {
    if (!this._validateInput(rows, config)) {
      throw new Error("Invalid input: rows must be an array and config must be an object");
    }

    if (!rows || rows.length === 0) {
      return [];
    }

    // Validate configuration (warnings logged but don't stop processing)
    this._validateConfig(config, rows[0]);

    const headers = Object.keys(rows[0]);

    return rows.map((row) => {
      const mapped = {};

      Object.keys(config).forEach(key => {
        const aliases = config[key];

        if (!Array.isArray(aliases)) {
          throw new Error(`Column config for '${key}' must be an array of aliases`);
        }

        const match = headers.find(h => aliases.includes(h));
        mapped[key] = match ? row[match] : null;
      });

      return mapped;
    });
  }
};

describe("ColumnDetector Module", () => {

  describe("mapColumns", () => {

    it("should map columns correctly", () => {
      const rows = [
        { "Company Code": "1000", "Account": "1100", "Amount": "1000" },
        { "Company Code": "2000", "Account": "1200", "Amount": "2000" }
      ];

      const config = {
        companyCode: ["Company Code"],
        account: ["Account"],
        amount: ["Amount"]
      };

      const result = ColumnDetectorModule.mapColumns(rows, config);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ companyCode: "1000", account: "1100", amount: "1000" });
      expect(result[1]).toEqual({ companyCode: "2000", account: "1200", amount: "2000" });
    });

    it("should handle column aliases", () => {
      const rows = [
        { "Bukrs": "1000", "HKONT": "1100" }
      ];

      const config = {
        companyCode: ["Company Code", "Bukrs"],
        account: ["Account", "HKONT"]
      };

      const result = ColumnDetectorModule.mapColumns(rows, config);

      expect(result[0].companyCode).toBe("1000");
      expect(result[0].account).toBe("1100");
    });

    it("should return null for missing columns", () => {
      const rows = [
        { "Company Code": "1000" }
      ];

      const config = {
        companyCode: ["Company Code"],
        missingColumn: ["Does Not Exist"]
      };

      const result = ColumnDetectorModule.mapColumns(rows, config);

      expect(result[0].companyCode).toBe("1000");
      expect(result[0].missingColumn).toBeNull();
    });

    it("should handle empty rows", () => {
      const result = ColumnDetectorModule.mapColumns([], {});
      expect(result).toEqual([]);
    });
  });

  describe("validation", () => {

    it("should throw error for non-array rows", () => {
      expect(() => {
        ColumnDetectorModule.mapColumns({ notArray: true }, {});
      }).toThrow("Invalid input");
    });

    it("should throw error for null config", () => {
      expect(() => {
        ColumnDetectorModule.mapColumns([], null);
      }).toThrow("Invalid input");
    });

    it("should throw error for invalid alias configuration", () => {
      const rows = [{ col1: "value1" }];
      const config = {
        mapped: "not an array" // Should be array
      };

      expect(() => {
        ColumnDetectorModule.mapColumns(rows, config);
      }).toThrow("must be an array");
    });
  });

  describe("_validateConfig", () => {

    it("should detect missing column aliases", () => {
      const firstRow = { col1: "value1", col2: "value2" };
      const config = {
        mapped1: ["Missing Column"],
        mapped2: ["col1"]
      };

      const warnings = ColumnDetectorModule._validateConfig(config, firstRow);

      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain("Missing Column");
      expect(warnings[0]).toContain("not found");
    });

    it("should pass with valid config", () => {
      const firstRow = { col1: "value1", col2: "value2" };
      const config = {
        mapped1: ["col1"],
        mapped2: ["col2"]
      };

      const warnings = ColumnDetectorModule._validateConfig(config, firstRow);
      expect(warnings).toHaveLength(0);
    });
  });
});
