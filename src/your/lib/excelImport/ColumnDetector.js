sap.ui.define([], function () {
  "use strict";

  /**
   * Detects and maps Excel columns based on configuration
   * @namespace your.lib.excelImport.ColumnDetector
   */
  return {

    /**
     * Maps Excel rows to configured column structure
     * @param {Array<Object>} rows - Array of row objects from Excel
     * @param {Object} config - Column configuration mapping
     * @returns {Array<Object>} Mapped rows with configured column names
     * @throws {Error} If rows or config are invalid
     * @example
     * const config = {
     *   companyCode: ['Company Code', 'Bukrs'],
     *   account: ['Account', 'HKONT']
     * };
     * const mapped = ColumnDetector.mapColumns(rows, config);
     */
    mapColumns(rows, config) {
      // Validate inputs
      if (!this._validateInput(rows, config)) {
        throw new Error("Invalid input: rows must be an array and config must be an object");
      }

      if (!rows || rows.length === 0) {
        return [];
      }

      // Validate configuration structure
      const configErrors = this._validateConfig(config, rows[0]);
      if (configErrors.length > 0) {
        console.warn("ColumnDetector warnings:", configErrors.join("; "));
      }

      const headers = Object.keys(rows[0]);

      return rows.map((row) => {
        const mapped = {};

        Object.keys(config).forEach(key => {
          const aliases = config[key];

          // Validate aliases is array
          if (!Array.isArray(aliases)) {
            throw new Error(`Column config for '${key}' must be an array of aliases`);
          }

          const match = headers.find(h => aliases.includes(h));
          mapped[key] = match ? row[match] : null;
        });

        return mapped;
      });
    },

    /**
     * Validates input parameters
     * @private
     * @param {*} rows - Rows to validate
     * @param {*} config - Config to validate
     * @returns {boolean} True if valid
     */
    _validateInput(rows, config) {
      return Array.isArray(rows) && typeof config === "object" && config !== null;
    },

    /**
     * Validates column configuration
     * @private
     * @param {Object} config - Configuration to validate
     * @param {Object} firstRow - First data row for reference
     * @returns {Array<string>} Array of warning messages
     */
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
    }

  };
});