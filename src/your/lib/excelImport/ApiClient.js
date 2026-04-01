sap.ui.define([], function () {
  "use strict";

  /**
   * HTTP API client for posting data
   * @namespace your.lib.excelImport.ApiClient
   */
  return {

    /**
     * Posts data to a URL endpoint
     * @param {string} url - Target URL endpoint
     * @param {Object} payload - Data payload to post
     * @param {number} timeout - Request timeout in milliseconds (optional, default: 30000)
     * @returns {Promise<Object>} Promise resolving to response JSON
     * @throws {Error} If URL is invalid, request fails, or timeout occurs
     * @example
     * const result = await ApiClient.post('/api/import', data);
     * // Returns: {success: true, ...}
     */
    async post(url, payload, timeout = 30000) {
      // Validate inputs
      if (!url || typeof url !== "string") {
        throw new Error("URL must be a non-empty string");
      }

      if (payload === null || payload === undefined) {
        throw new Error("Payload is required");
      }

      if (typeof timeout !== "number" || timeout <= 0) {
        throw new Error("Timeout must be a positive number in milliseconds");
      }

      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        let response;
        try {
          response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            signal: controller.signal
          });
        } finally {
          clearTimeout(timeoutId);
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }

        return await response.json();
      } catch (error) {
        if (error.name === "AbortError") {
          throw new Error(`Request timeout after ${timeout}ms`);
        }
        throw new Error(`API request failed: ${error.message}`);
      }
    }

  };
});