# Testing Patterns

**Analysis Date:** 2026-03-29

## Test Framework

**Runner:**
- Jest 28 with `ts-jest`
- Config: `jest.config.js`

**Assertion Library:**
- Jest built-in assertions and mock matchers

**Run Commands:**
```bash
npm run test         # Run all tests under src/!tests
npm run test:watch   # Watch mode
npx jest --coverage src/!tests   # Coverage run using jest.config.js thresholds
```

## Test File Organization

**Location:**
- Unit tests live under `src/!tests/unit-tests/`.
- Shared test helpers and generators live under `src/!tests/utils/`.
- Snapshot files are co-located in `__snapshots__` folders, for example `src/!tests/unit-tests/0 - utils/__snapshots__/namesHelper.test.ts.snap`.

**Naming:**
- Test files use the source module name plus `.test.ts`, for example `src/!tests/unit-tests/0 - utils/request.test.ts` and `src/!tests/unit-tests/jobs/updateNameChangesCsv/updateNameChangesCsv.test.ts`.
- Test directories mirror the production pipeline layers instead of using package-style domains, for example `src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/` and `src/!tests/unit-tests/3 - statistics/`.

**Structure:**
```text
src/!tests/
├── unit-tests/
│   ├── 0 - utils/
│   ├── 1 - replays, 2 - parseReplayInfo/
│   ├── 2 - parseReplayInfo/
│   ├── 3 - statistics/
│   ├── jobs/
│   ├── index.test.ts
│   └── schedule.test.ts
└── utils/
    ├── generators/
    ├── consts.ts
    ├── prepareNamesWithMock.ts
    └── getDefaultTestDescription.ts
```

## Test Structure

**Suite Organization:**
```typescript
describe('getRuntimeConfig', () => {
  const originalWorkerCount = process.env.WORKER_COUNT;

  beforeEach(() => {
    delete process.env.WORKER_COUNT;
    jest.restoreAllMocks();
  });

  afterAll(() => {
    if (originalWorkerCount === undefined) {
      delete process.env.WORKER_COUNT;
      return;
    }

    process.env.WORKER_COUNT = originalWorkerCount;
  });

  test('returns default worker count based on CPU count minus one', () => {
    jest.spyOn(os, 'cpus').mockReturnValue(createCpuInfo(8));
    expect(getRuntimeConfig()).toEqual({ workerCount: 7 });
  });
});
```
Pattern source: `src/!tests/unit-tests/0 - utils/runtimeConfig.test.ts`

**Patterns:**
- Use top-level `test(...)` for independent cases and `describe(...)` when grouping behavior families. Both styles are present; follow the surrounding file.
- Reset mocks in `beforeEach(...)` rather than relying on global Jest reset options. Examples: `src/!tests/unit-tests/index.test.ts`, `src/!tests/unit-tests/schedule.test.ts`, and `src/!tests/unit-tests/0 - utils/request.test.ts`.
- Restore environmental mutations explicitly in `afterAll(...)` or `afterEach(...)`, for example timers in `src/!tests/unit-tests/0 - utils/request.test.ts` and env vars in `src/!tests/unit-tests/0 - utils/runtimeConfig.test.ts`.
- Use invocation-order assertions when orchestration order matters. Examples: `src/!tests/unit-tests/index.test.ts` and `src/!tests/unit-tests/schedule.test.ts`.

## Mocking

**Framework:** Jest mocks and spies

**Patterns:**
```typescript
jest.mock('../../0 - utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockedLogger = logger as unknown as {
  info: jest.Mock;
};

beforeEach(() => {
  mockedLogger.info.mockReset();
});
```
Pattern source: `src/!tests/unit-tests/index.test.ts`

```typescript
jest.spyOn(os, 'cpus').mockReturnValue(createCpuInfo(8));
jest.spyOn(syncParse, 'parse').mockReturnValue(exampleNamesChanges);
```
Pattern sources: `src/!tests/unit-tests/0 - utils/runtimeConfig.test.ts`, `src/!tests/unit-tests/3 - statistics/calculateGlobalStatisticsWithNameChanges.test.ts`

**What to Mock:**
- External packages and system boundaries: `fs-extra`, `node-fetch`, `croner`, `worker_threads`, and `csv-parse`. See `src/!tests/unit-tests/schedule.test.ts`, `src/!tests/unit-tests/0 - utils/request.test.ts`, and `src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/workers/workerPool.test.ts`.
- Cross-module collaborators for orchestration tests, for example `../../1 - replays/getReplays`, `../../4 - output`, and `../../0 - utils/parsingStatus` in `src/!tests/unit-tests/index.test.ts`.
- Logger methods directly, usually via a mocked default export object.

**What NOT to Mock:**
- Pure transformation logic when the goal is result correctness. Statistics and parsing tests feed constructed replay data into real implementations, for example `src/!tests/unit-tests/2 - parseReplayInfo/parseReplayInfo.test.ts` and `src/!tests/unit-tests/3 - statistics/calculateGlobalStatistics.test.ts`.
- Factory helpers under `src/!tests/utils/generators/`; reuse them instead of re-mocking raw shapes.

## Fixtures and Factories

**Test Data:**
```typescript
const generateReplay = (
  gameType: GameType | SkippedGameTypes,
  filename: Replay['filename'],
  date?: Replay['date'],
): Replay => ({
  mission_name: `${gameType}@${defaultName}`,
  date: date || 'some_date',
  filename,
  replayLink: '/replays/123',
  serverId: 1,
  world_name: 'unknown',
});
```
Pattern source: `src/!tests/utils/generators/generateReplay.ts`

```typescript
const prepareNamesWithMock = () => {
  jest.mock('csv-parse');
  jest.spyOn(syncParse, 'parse').mockReturnValueOnce([]);
  prepareNamesList();
};
```
Pattern source: `src/!tests/utils/prepareNamesWithMock.ts`

**Location:**
- Reusable entity/replay/statistics generators live in `src/!tests/utils/generators/`.
- Larger fixed datasets live next to their suites under `data/`, for example `src/!tests/unit-tests/3 - statistics/data/forGlobalStatistics.ts` and `src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/data/parseReplays.ts`.

## Coverage

**Requirements:** Global 100% thresholds for branches, functions, lines, and statements in `jest.config.js`.

**View Coverage:**
```bash
npx jest --coverage src/!tests
```

**Scope exclusions:**
- Coverage excludes entrypoints, output generation, year-statistics code, job wrappers, tests, and selected utility files via `collectCoverageFrom` in `jest.config.js`.

## Test Types

**Unit Tests:**
- Dominant test type. Most suites target one utility/module at a time with explicit mocks around boundaries. Examples: `src/!tests/unit-tests/0 - utils/request.test.ts` and `src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/workers/workerData.test.ts`.

**Integration Tests:**
- Thin integration-style orchestration tests exist for top-level flows such as `src/!tests/unit-tests/index.test.ts` and `src/!tests/unit-tests/schedule.test.ts`. These still mock network, file system, workers, and collaborators, so they are integration-in-shape rather than full runtime integration.

**E2E Tests:**
- Not used.

## Common Patterns

**Async Testing:**
```typescript
await expect(request('https://sg.zone/replays?p=2')).resolves.toBe(proxiedResponse);
await expect(startFetchingReplays(null)).rejects.toThrow('Cloudflare');
```
Pattern sources: `src/!tests/unit-tests/0 - utils/request.test.ts`, `src/!tests/unit-tests/jobs/prepareReplaysList/startFetchingReplays.test.ts`

**Error Testing:**
```typescript
mockedGenerateOutput.mockRejectedValue(new Error('output failed'));

await expect(startParsingReplays()).rejects.toThrow('output failed');
expect(mockedCommitParsingStatus).not.toHaveBeenCalled();
```
Pattern source: `src/!tests/unit-tests/index.test.ts`

**Snapshot Testing:**
```typescript
const resultGlobalStatistics = calculateGlobalStatistics(playersGameResult);
expect(resultGlobalStatistics).toMatchSnapshot();
```
Pattern source: `src/!tests/unit-tests/3 - statistics/calculateGlobalStatisticsWithNameChanges.test.ts`

**Timer and time control:**
- Use fake timers when testing timeout behavior. Example: `src/!tests/unit-tests/0 - utils/request.test.ts`.

**Worker/thread simulation:**
- Replace `worker_threads.Worker` with an `EventEmitter`-backed mock class to drive message, error, and exit behavior deterministically. See `src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/workers/workerPool.test.ts`.

## Verification Workflow

**Repo-required commands after code changes:**
```bash
npm run lint
npm run test
npm run build-dist
```
Requirement source: `AGENTS.md`

**Architecture sync requirement after changes:**
- Re-read and update `docs/architecture.md` whenever code, config, or documentation changes alter behavior or responsibilities. Requirement source: `AGENTS.md`.

---

*Testing analysis: 2026-03-29*
