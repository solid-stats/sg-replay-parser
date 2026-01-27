module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  automock: false,
  resetMocks: false,
  coverageReporters: ['clover', 'json', 'lcov'],
  coverageThreshold: {
    global: {
      lines: 100,
    },
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/src/generated/',
    '/src/jobs/',
    '/src/services/',
    '/src/shared/utils/logger.ts',
    '/src/shared/utils/request.ts',
    '/src/db/seed/',
  ],
};
