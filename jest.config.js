module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  "setupFiles": [
    "./src/!tests/setupFetch.ts"
  ],
  collectCoverage: false,
  collectCoverageFrom: [
    './src/**/*.ts',
    '!./src/**/*.d.ts',
    '!./src/index.ts',
    '!./src/*utils/progressHandler.ts',
    '!./src/*utils/formatGameType.ts',
    '!./src/*utils/pipe.ts',
    '!./src/*utils/promiseAllWithProgress.ts',
    '!./src/*output/**/*.ts',
    '!./src/!prepareReplaysList/**/*.ts',
    '!./src/!yearStatistics/**/*.ts',
    '!./src/!tests/**/*.ts',
  ],
  "automock": false,
  "resetMocks": false,
  "coverageReporters": ["clover", "json", "lcov"],
  "coverageThreshold": {
    "global": {
      "lines": 100,
    },
  },
}
