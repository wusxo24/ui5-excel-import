/**
 * Jest Configuration for UI5 Excel Import Library
 * Runs unit tests for core modules
 */
module.exports = {
  displayName: "unit",
  testEnvironment: "node",
  moduleFileExtensions: ["js", "json"],
  testMatch: ["**/__tests__/**/*.js", "**/*.test.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.d.js",
    "!src/**/index.js"
  ],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  coveragePathIgnorePatterns: ["/node_modules/", "/test/"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
  globals: {
    // Mock global XLSX object from xlsx library
    XLSX: {}
  }
};
