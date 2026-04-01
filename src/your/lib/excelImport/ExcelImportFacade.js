sap.ui.define([
  "./ExcelReader",
  "./ColumnDetector",
  "./BatchProcessor",
  "./ApiClient"
], function (Reader, Detector, Batch, Api) {
  "use strict";

  /**
   * Main facade for Excel import operations
   * Provides simplified interface for common import workflows
   * @namespace your.lib.excelImport.ExcelImportFacade
   */
  return {

    /**
     * Parses Excel file and maps columns without posting data
     * @param {Object} options - Configuration options
     * @param {File} options.file - Excel file to parse
     * @param {Object} options.columns - Column mapping configuration
     * @returns {Promise<{data: Array<Object>, errors: Array<string>, rowsProcessed: number}>} Parsed and mapped data with errors
     * @throws {Error} If file or columns are missing or invalid
     * @example
     * const result = await ExcelImportFacade.parseOnly({
     *   file: excelFile,
     *   columns: {
     *     companyCode: ['Company Code', 'Bukrs'],
     *     account: ['Account', 'HKONT']
     *   }
     * });
     */
    async parseOnly({ file, columns }) {
      // Validate required parameters
      if (!file) {
        throw new Error("File is required for parseOnly operation");
      }

      if (!columns || typeof columns !== "object") {
        throw new Error("Column configuration is required and must be an object");
      }

      if (Object.keys(columns).length === 0) {
        throw new Error("Column configuration cannot be empty");
      }

      const errors = [];

      try {
        const rows = await Reader.read(file);
        const mapped = Detector.mapColumns(rows, columns);

        return {
          data: mapped,
          errors: [],
          rowsProcessed: mapped.length
        };
      } catch (error) {
        errors.push(error.message);
        return {
          data: [],
          errors: errors,
          rowsProcessed: 0
        };
      }
    },

    /**
     * Parses Excel and posts data in batches to API
     * @param {Object} options - Configuration options
     * @param {File} options.file - Excel file to parse
     * @param {Object} options.columns - Column mapping configuration
     * @param {Object} options.mapper - Mapper object with map() function
     * @param {string} options.uploadUrl - API endpoint URL for posting
     * @param {string} options.fileName - File name to include in request
     * @param {boolean} options.testMode - Test mode flag (optional, default: false)
     * @param {number} options.batchSize - Batch size for API calls (optional, default: 50)
     * @returns {Promise<Array<Object>>} Array of API responses for each batch
     * @throws {Error} If required parameters are missing or invalid
     * @example
     * const responses = await ExcelImportFacade.parseAndPost({
     *   file: excelFile,
     *   columns: config,
     *   mapper: PayloadMapper,
     *   uploadUrl: '/api/import',
     *   fileName: 'data.xlsx',
     *   testMode: false,
     *   batchSize: 50
     * });
     */
    async parseAndPost({
      file,
      columns,
      mapper,
      uploadUrl,
      fileName,
      testMode = false,
      batchSize = 50
    }) {
      // Validate all required parameters
      if (!file) {
        throw new Error("File is required");
      }

      if (!columns || typeof columns !== "object" || Object.keys(columns).length === 0) {
        throw new Error("Column configuration is required and cannot be empty");
      }

      if (!mapper || typeof mapper.map !== "function") {
        throw new Error("Mapper object with map() function is required");
      }

      if (!uploadUrl || typeof uploadUrl !== "string") {
        throw new Error("Upload URL must be a non-empty string");
      }

      if (!fileName || typeof fileName !== "string") {
        throw new Error("File name is required");
      }

      if (typeof batchSize !== "number" || batchSize <= 0) {
        throw new Error("Batch size must be a positive number");
      }

      try {
        // Step 1: Parse file
        const rows = await Reader.read(file);
        const mapped = Detector.mapColumns(rows, columns);

        // Step 2: Transform data
        const payload = mapper.map(mapped);

        // Step 3: Create batches
        const batches = Batch.create(payload, batchSize);

        // Step 4: Post batches
        const responses = [];
        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          const res = await Api.post(
            uploadUrl,
            {
              fileName,
              testMode,
              batchNumber: i + 1,
              batchTotal: batches.length,
              data: batch
            },
            30000 // 30 second timeout
          );
          responses.push(res);
        }

        return responses;
      } catch (error) {
        throw new Error(`Excel import failed: ${error.message}`);
      }
    },

    /**
     * Posts already-mapped data in batches (legacy method)
     * @deprecated Use parseAndPost() instead for complete workflow
     * @param {Object} options - Configuration options
     * @returns {Promise<Array<Object>>} API responses
     */
    async postOnly({ data, mapper, uploadUrl, fileName, testMode, batchSize = 50 }) {
      console.warn("postOnly() is deprecated. Use parseAndPost() for complete workflow.");

      if (!data || !Array.isArray(data)) {
        throw new Error("Data must be an array");
      }

      if (!mapper || typeof mapper.map !== "function") {
        throw new Error("Mapper with map() function is required");
      }

      if (!uploadUrl || typeof uploadUrl !== "string") {
        throw new Error("Upload URL is required");
      }

      const payload = mapper.map(data);
      const batches = Batch.create(payload, batchSize);
      const responses = [];

      for (const batch of batches) {
        const res = await Api.post(
          uploadUrl,
          {
            fileName,
            testMode,
            data: batch
          },
          30000
        );
        responses.push(res);
      }

      return responses;
    }

  };
});