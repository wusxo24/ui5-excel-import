/**
 * BatchProcessor Module Tests
 */

const BatchProcessorModule = {
  create(data, size) {
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

describe("BatchProcessor Module", () => {

  describe("create", () => {

    it("should create batches of correct size", () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const batches = BatchProcessorModule.create(data, 3);

      expect(batches).toHaveLength(4);
      expect(batches[0]).toEqual([1, 2, 3]);
      expect(batches[1]).toEqual([4, 5, 6]);
      expect(batches[2]).toEqual([7, 8, 9]);
      expect(batches[3]).toEqual([10]);
    });

    it("should handle single batch", () => {
      const data = [1, 2, 3];
      const batches = BatchProcessorModule.create(data, 5);

      expect(batches).toHaveLength(1);
      expect(batches[0]).toEqual([1, 2, 3]);
    });

    it("should handle empty array", () => {
      const batches = BatchProcessorModule.create([], 10);
      expect(batches).toEqual([]);
    });

    it("should handle batch size of 1", () => {
      const data = [1, 2, 3];
      const batches = BatchProcessorModule.create(data, 1);

      expect(batches).toHaveLength(3);
      expect(batches[0]).toEqual([1]);
      expect(batches[1]).toEqual([2]);
      expect(batches[2]).toEqual([3]);
    });

    it("should handle large batches", () => {
      const data = Array.from({ length: 1000 }, (_, i) => i);
      const batches = BatchProcessorModule.create(data, 100);

      expect(batches).toHaveLength(10);
      expect(batches[0]).toHaveLength(100);
      expect(batches[9]).toHaveLength(100);
    });
  });

  describe("validation", () => {

    it("should throw error for non-array data", () => {
      expect(() => {
        BatchProcessorModule.create({ notArray: true }, 10);
      }).toThrow("Data must be an array");
    });

    it("should throw error for zero batch size", () => {
      expect(() => {
        BatchProcessorModule.create([1, 2, 3], 0);
      }).toThrow("Batch size must be a positive number");
    });

    it("should throw error for negative batch size", () => {
      expect(() => {
        BatchProcessorModule.create([1, 2, 3], -10);
      }).toThrow("Batch size must be a positive number");
    });

    it("should throw error for non-integer batch size", () => {
      expect(() => {
        BatchProcessorModule.create([1, 2, 3], 10.5);
      }).toThrow("Batch size must be an integer");
    });

    it("should throw error for non-number batch size", () => {
      expect(() => {
        BatchProcessorModule.create([1, 2, 3], "10");
      }).toThrow("Batch size must be a positive number");
    });

    it("should throw error for null batch size", () => {
      expect(() => {
        BatchProcessorModule.create([1, 2, 3], null);
      }).toThrow("Batch size must be a positive number");
    });
  });
});
