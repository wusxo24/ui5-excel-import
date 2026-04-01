/**
 * ApiClient Module Tests
 */

const ApiClientModule = {
  async post(url, payload, timeout = 30000) {
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

describe("ApiClient Module", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("post", () => {

    it("should post data successfully", async () => {
      const mockResponse = { success: true, data: [1, 2, 3] };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockResponse
      });

      const result = await ApiClientModule.post("/api/import", { test: "data" });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/import",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" }
        })
      );
    });

    it("should respect custom timeout", async () => {
      global.fetch = jest.fn().mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              headers: new Headers({ "content-type": "application/json" }),
              json: async () => ({ success: true })
            });
          }, 2000);
        });
      });

      try {
        await ApiClientModule.post("/api/import", { test: "data" }, 1000);
      } catch (error) {
        expect(error.message).toContain("timeout");
      }
    }, 10000);

    it("should handle HTTP errors", async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers({ "content-type": "application/json" })
      });

      await expect(ApiClientModule.post("/api/import", {})).rejects.toThrow("HTTP 500");
    });

    it("should reject if response is not JSON", async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "text/html" })
      });

      await expect(ApiClientModule.post("/api/import", {})).rejects.toThrow("Response is not JSON");
    });
  });

  describe("validation", () => {

    it("should throw error for empty URL", async () => {
      await expect(ApiClientModule.post("", {})).rejects.toThrow("URL must be a non-empty string");
    });

    it("should throw error for null URL", async () => {
      await expect(ApiClientModule.post(null, {})).rejects.toThrow("URL must be a non-empty string");
    });

    it("should throw error for null payload", async () => {
      await expect(ApiClientModule.post("/api/test", null)).rejects.toThrow("Payload is required");
    });

    it("should throw error for undefined payload", async () => {
      await expect(ApiClientModule.post("/api/test", undefined)).rejects.toThrow("Payload is required");
    });

    it("should throw error for invalid timeout", async () => {
      await expect(ApiClientModule.post("/api/test", {}, 0)).rejects.toThrow("Timeout must be a positive number");
    });

    it("should throw error for negative timeout", async () => {
      await expect(ApiClientModule.post("/api/test", {}, -1000)).rejects.toThrow("Timeout must be a positive number");
    });

    it("should throw error for non-number timeout", async () => {
      await expect(ApiClientModule.post("/api/test", {}, "30000")).rejects.toThrow("Timeout must be a positive number");
    });
  });
});
