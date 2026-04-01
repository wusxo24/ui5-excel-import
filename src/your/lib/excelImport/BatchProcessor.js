sap.ui.define([], function () {
  "use strict";

  /**
   * Splits data into batches for processing
   * @namespace your.lib.excelImport.BatchProcessor
   */
  return {

    /**
     * Creates batches of specified size from data array
     * @param {Array} data - Data to split into batches
     * @param {number} size - Size of each batch
     * @returns {Array<Array>} Array of batch arrays
     * @throws {Error} If inputs are invalid
     * @example
     * const batches = BatchProcessor.create(data, 50);
     * // Returns: [[item1, item2, ...], [item51, item52, ...], ...]
     */
    create(data, size) {
      // Validate inputs
      if (!Array.isArray(data)) {
        throw new Error("Data must be an array");
      }

      if (typeof size !== "number" || size <= 0) {
        throw new Error("Batch size must be a positive number");
      }

      if (!Number.isInteger(size)) {
        throw new Error("Batch size must be an integer");
      }

      if (data.length === 0) {
        return [];
      }

      const batches = [];

      for (let i = 0; i < data.length; i += size) {
        batches.push(data.slice(i, i + size));
      }

      return batches;
    }

  };
});