module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  "setupFiles": [
    "./src/!tests/setupFetch.ts"
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    './src/**/*.ts',
    '!./src/**/*.d.ts',
    '!./src/index.ts',
    '!./src/!prepareReplaysList/**/*.ts',
    '!./src/!tests/**/*.ts',
  ],
  "automock": false,
  "resetMocks": false,
  "coverageReporters": ["clover", "json", "lcov"],
  "coverageThreshold": {
    "global": {
      "lines": 60,
    },
  },
}
