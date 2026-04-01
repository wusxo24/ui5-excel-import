/**
 * Test Setup - Initializes test environment
 */

// Mock XLSX library
global.XLSX = {
  read: jest.fn(),
  utils: {
    sheet_to_row_object_array: jest.fn()
  }
};

// Mock FileReader API
global.FileReader = class FileReader {
  readAsBinaryString(_file) {
    // Mock implementation
  }
};

// Mock Fetch API
global.fetch = jest.fn();

// Mock AbortController
global.AbortController = class AbortController {
  abort() {
    // Mock implementation
  }
};
