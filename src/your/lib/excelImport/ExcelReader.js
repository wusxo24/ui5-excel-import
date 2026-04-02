sap.ui.define([
  "your/lib/xlsx/xlsx.bundle"
], function (bundledXLSX) {
  "use strict";

  /**
   * Reads and parses Excel files (.xlsx)
   * @namespace your.lib.excelImport.ExcelReader
   */

  // Store for injected XLSX instance (optional, for external libraries)
  let injectedXLSX = null;

  return {

    /**
     * Set the XLSX library instance (for dependency injection)
     * This allows using an external XLSX library instead of the bundled one.
     * Call this at application startup to avoid double-bundling.
     * @param {Object} xlsxLib - SheetJS/XLSX library instance with read() and utils properties
     * @throws {Error} If xlsxLib is invalid or missing required methods
     * @example
     * import XLSX from 'xlsx';
     * ExcelReader.setXLSX(XLSX);
     */
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

    /**
     * Get the active XLSX instance (injected or bundled)
     * @private
     * @returns {Object} The XLSX library instance
     * @throws {Error} If no XLSX instance is available
     */
    _getXLSX() {
      // Prefer injected instance
      if (injectedXLSX) {
        return injectedXLSX;
      }

      // Fall back to bundled XLSX
      if (bundledXLSX) {
        return bundledXLSX;
      }

      // Error if neither available
      throw new Error(
        "XLSX library not available. Either bundle includes it or call setXLSX() with your XLSX instance."
      );
    },

    /**
     * Reads an Excel file and converts it to JSON array
     * @param {File} file - The Excel file to read
     * @returns {Promise<Array<Object>>} Promise resolving to array of row objects
     * @throws {Error} If file is not valid, is not an Excel file, or reading fails
     * @example
     * const rows = await ExcelReader.read(excelFile);
     * // Returns: [{col1: 'value1', col2: 'value2'}, ...]
     */
    read(file) {
      // Validate input
      if (!file) {
        return Promise.reject(new Error("File is required"));
      }

      if (!(file instanceof File) && !(file instanceof Blob)) {
        return Promise.reject(new Error("Invalid file object"));
      }

      // Validate file type
      if (!this._isExcelFile(file)) {
        return Promise.reject(new Error("File must be an Excel file (.xlsx, .xls, .csv)"));
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const data = e.target.result;

            if (!data) {
              reject(new Error("Failed to read file data"));
              return;
            }

            const XLSX = this._getXLSX();
            const workbook = XLSX.read(data, { type: "binary" });

            if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
              reject(new Error("Excel file has no sheets or is corrupted"));
              return;
            }

            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_row_object_array(sheet);

            if (!json || json.length === 0) {
              reject(new Error("Excel sheet is empty or contains no valid data"));
              return;
            }

            resolve(json);
          } catch (error) {
            reject(new Error(`Failed to parse Excel file: ${error.message}`));
          }
        };

        reader.onerror = () => {
          reject(new Error("Failed to read file: FileReader error"));
        };

        reader.onabort = () => {
          reject(new Error("File reading was aborted"));
        };

        try {
          reader.readAsBinaryString(file);
        } catch (error) {
          reject(new Error(`Failed to initiate file reading: ${error.message}`));
        }
      });
    },

    /**
     * Validates if file is an Excel file
     * @private
     * @param {File} file - File to validate
     * @returns {boolean} True if file appears to be Excel format
     */
    _isExcelFile(file) {
      const excelMimeTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv"
      ];

      const excelExtensions = [".xlsx", ".xls", ".csv"];
      const fileName = file.name || "";
      const hasValidExtension = excelExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
      const hasValidMimeType = excelMimeTypes.includes(file.type);

      return hasValidExtension || hasValidMimeType || fileName.toLowerCase().endsWith(".xlsx");
    }

  };
});