module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    './src/**/*.ts',
    '!./src/**/*.d.ts',
    '!./src/index.ts',
    '!./src/!prepareReplaysList/**/*.ts',
    '!./src/!tests/**/*.ts',
  ]
}
