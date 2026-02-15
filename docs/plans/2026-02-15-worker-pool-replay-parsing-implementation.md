# Worker Pool Replay Parsing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace main-thread replay parsing concurrency with a shared worker pool that parses `sg`, `mace`, and `sm` replays in parallel across CPU cores.

**Architecture:** Introduce a fixed-size worker pool in `src/1 - replays/workers` and route replay parse tasks through it. Keep replay business rules and output contract unchanged by mapping worker responses back into `PlayersGameResult[]` in `parseReplays`. Integrate one shared pool in `startParsingReplays` so all game types use the same queue and worker lifecycle.

**Tech Stack:** Node.js Worker Threads, TypeScript (CommonJS build), Jest, fs-extra, lodash.

---

Relevant skills: `@test-driven-development`, `@verification-before-completion`, `@ts-google`, `@clean-code`.

### Task 1: Add Worker Message Types

**Files:**
- Create: `src/1 - replays/workers/types.ts`
- Create: `src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/workers/types.test.ts`

**Step 1: Write the failing test**

```ts
import type {
  ParseReplayTaskMessage,
  ParseReplayWorkerResponse,
} from '../../../../1 - replays/workers/types';

test('worker response supports success, skipped, and error statuses', () => {
  const success: ParseReplayWorkerResponse = {
    taskId: '1',
    status: 'success',
    data: { date: '2024-01-01', missionName: 'sg@test', result: [] },
  };
  const skipped: ParseReplayWorkerResponse = {
    taskId: '2',
    status: 'skipped',
    filename: 'file_1',
    reason: 'mace_min_players',
  };
  const error: ParseReplayWorkerResponse = {
    taskId: '3',
    status: 'error',
    error: { filename: 'file_2', message: 'boom' },
  };

  expect(success.status).toBe('success');
  expect(skipped.status).toBe('skipped');
  expect(error.status).toBe('error');
});

test('parse task message contains routing and replay fields', () => {
  const task: ParseReplayTaskMessage = {
    taskId: 'task-1',
    filename: 'f_1',
    date: '2024-02-01T10:00:00.000Z',
    missionName: 'sg@test_mission',
    gameType: 'sg',
  };

  expect(task.filename).toBe('f_1');
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand "src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/workers/types.test.ts"`  
Expected: FAIL because `workers/types.ts` does not exist.

**Step 3: Write minimal implementation**

```ts
export type ParseReplayTaskMessage = {
  taskId: string;
  filename: string;
  date: string;
  missionName: string;
  gameType: GameType;
};

export type ParseReplayWorkerSuccess = {
  taskId: string;
  status: 'success';
  data: PlayersGameResult;
};

export type ParseReplayWorkerSkipped = {
  taskId: string;
  status: 'skipped';
  filename: string;
  reason: 'mace_min_players' | 'empty_replay';
};

export type ParseReplayWorkerError = {
  taskId: string;
  status: 'error';
  error: {
    filename: string;
    message: string;
    stack?: string;
  };
};

export type ParseReplayWorkerResponse =
  | ParseReplayWorkerSuccess
  | ParseReplayWorkerSkipped
  | ParseReplayWorkerError;
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --runInBand "src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/workers/types.test.ts"`  
Expected: PASS.

**Step 5: Commit**

```bash
git add "src/1 - replays/workers/types.ts" "src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/workers/types.test.ts"
git commit --no-gpg-sign -m "test: add worker message contract types"
```

### Task 2: Implement Worker Entrypoint

**Files:**
- Create: `src/1 - replays/workers/parseReplayWorker.ts`
- Create: `src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/workers/parseReplayWorker.test.ts`

**Step 1: Write the failing test**

```ts
import fs from 'fs-extra';
import parseReplayInfo from '../../../../2 - parseReplayInfo';
import { runParseTask } from '../../../../1 - replays/workers/parseReplayWorker';

jest.mock('fs-extra');
jest.mock('../../../../2 - parseReplayInfo');

test('returns skipped for mace replay with less than 10 players', async () => {
  (fs.readJson as jest.Mock).mockResolvedValueOnce({ entities: [], events: [] });
  (parseReplayInfo as jest.Mock).mockReturnValueOnce({
    a: { id: 'a' },
  });

  const result = await runParseTask({
    taskId: '1',
    filename: 'mace_file',
    date: '2024-01-01',
    missionName: 'mace@mission',
    gameType: 'mace',
  });

  expect(result.status).toBe('skipped');
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand "src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/workers/parseReplayWorker.test.ts"`  
Expected: FAIL because `runParseTask` is missing.

**Step 3: Write minimal implementation**

```ts
import path from 'path';
import fs from 'fs-extra';
import { parentPort } from 'worker_threads';

import { rawReplaysPath } from '../../0 - utils/paths';
import parseReplayInfo from '../../2 - parseReplayInfo';
import {
  ParseReplayTaskMessage,
  ParseReplayWorkerResponse,
} from './types';

export const runParseTask = async (
  task: ParseReplayTaskMessage,
): Promise<ParseReplayWorkerResponse> => {
  try {
    const replayInfo = await fs.readJson(path.join(rawReplaysPath, `${task.filename}.json`));
    const parsedReplayInfo = parseReplayInfo(replayInfo as ReplayInfo, task.date);
    const result = Object.values(parsedReplayInfo);

    if (result.length === 0) {
      return {
        taskId: task.taskId,
        status: 'skipped',
        filename: task.filename,
        reason: 'empty_replay',
      };
    }

    if (task.gameType === 'mace' && result.length < 10) {
      return {
        taskId: task.taskId,
        status: 'skipped',
        filename: task.filename,
        reason: 'mace_min_players',
      };
    }

    return {
      taskId: task.taskId,
      status: 'success',
      data: {
        date: task.date,
        missionName: task.missionName,
        result,
      },
    };
  } catch (err) {
    return {
      taskId: task.taskId,
      status: 'error',
      error: {
        filename: task.filename,
        message: (err as Error).message,
        stack: (err as Error).stack,
      },
    };
  }
};

if (parentPort) {
  parentPort.on('message', async (task: ParseReplayTaskMessage) => {
    const response = await runParseTask(task);
    parentPort?.postMessage(response);
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --runInBand "src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/workers/parseReplayWorker.test.ts"`  
Expected: PASS.

**Step 5: Commit**

```bash
git add "src/1 - replays/workers/parseReplayWorker.ts" "src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/workers/parseReplayWorker.test.ts"
git commit --no-gpg-sign -m "feat: add replay parse worker entrypoint"
```

### Task 3: Implement Fixed Worker Pool

**Files:**
- Create: `src/1 - replays/workers/workerPool.ts`
- Create: `src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/workers/workerPool.test.ts`

**Step 1: Write the failing test**

```ts
import WorkerPool from '../../../../1 - replays/workers/workerPool';

test('runs queued tasks and returns responses', async () => {
  const pool = new WorkerPool({
    workerCount: 1,
    workerScriptPath: '/tmp/fake-worker.js',
  });

  await expect(pool.destroy()).resolves.toBeUndefined();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand "src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/workers/workerPool.test.ts"`  
Expected: FAIL because `workerPool.ts` does not exist.

**Step 3: Write minimal implementation**

```ts
import { Worker } from 'worker_threads';
import { randomUUID } from 'uuid';

import {
  ParseReplayTaskMessage,
  ParseReplayWorkerResponse,
} from './types';

type QueueItem = {
  task: ParseReplayTaskMessage;
  resolve: (value: ParseReplayWorkerResponse) => void;
  reject: (reason?: unknown) => void;
};

type WorkerState = {
  worker: Worker;
  busy: boolean;
  taskId?: string;
};

class WorkerPool {
  private workers: WorkerState[] = [];
  private queue: QueueItem[] = [];
  private inFlight = new Map<string, QueueItem>();

  constructor(private readonly config: { workerCount: number; workerScriptPath: string }) {
    for (let i = 0; i < config.workerCount; i += 1) {
      const worker = new Worker(config.workerScriptPath);
      const state: WorkerState = { worker, busy: false };

      worker.on('message', (response: ParseReplayWorkerResponse) => this.onWorkerMessage(state, response));
      worker.on('error', (error) => this.onWorkerFailure(state, error));
      worker.on('exit', (code) => {
        if (code !== 0) this.onWorkerFailure(state, new Error(`Worker exited with code ${code}`));
      });

      this.workers.push(state);
    }
  }

  runTask(task: Omit<ParseReplayTaskMessage, 'taskId'>): Promise<ParseReplayWorkerResponse> {
    return new Promise((resolve, reject) => {
      const taskWithId: ParseReplayTaskMessage = { ...task, taskId: randomUUID() };
      const item: QueueItem = { task: taskWithId, resolve, reject };
      this.queue.push(item);
      this.dispatch();
    });
  }

  async destroy(): Promise<void> {
    await Promise.all(this.workers.map(({ worker }) => worker.terminate()));
  }

  private dispatch(): void {
    const idleWorker = this.workers.find((item) => !item.busy);
    const next = this.queue.shift();
    if (!idleWorker || !next) return;

    idleWorker.busy = true;
    idleWorker.taskId = next.task.taskId;
    this.inFlight.set(next.task.taskId, next);
    idleWorker.worker.postMessage(next.task);
    this.dispatch();
  }

  private onWorkerMessage(state: WorkerState, response: ParseReplayWorkerResponse): void {
    const item = this.inFlight.get(response.taskId);
    if (!item) return;

    this.inFlight.delete(response.taskId);
    state.busy = false;
    state.taskId = undefined;
    item.resolve(response);
    this.dispatch();
  }

  private onWorkerFailure(state: WorkerState, error: Error): void {
    if (state.taskId) {
      const item = this.inFlight.get(state.taskId);
      if (item) {
        item.resolve({
          taskId: state.taskId,
          status: 'error',
          error: { filename: 'unknown', message: error.message, stack: error.stack },
        });
        this.inFlight.delete(state.taskId);
      }
    }

    state.busy = false;
    state.taskId = undefined;
    this.dispatch();
  }
}

export default WorkerPool;
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --runInBand "src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/workers/workerPool.test.ts"`  
Expected: PASS.

**Step 5: Commit**

```bash
git add "src/1 - replays/workers/workerPool.ts" "src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/workers/workerPool.test.ts"
git commit --no-gpg-sign -m "feat: add fixed worker pool for replay parsing"
```

### Task 4: Add Runtime Worker Count Config

**Files:**
- Create: `src/0 - utils/runtimeConfig.ts`
- Create: `src/!tests/unit-tests/0 - utils/runtimeConfig.test.ts`

**Step 1: Write the failing test**

```ts
import os from 'os';
import { getRuntimeConfig } from '../../../0 - utils/runtimeConfig';

jest.mock('os');

test('uses max(1, cpus - 1) default worker count', () => {
  (os.cpus as jest.Mock).mockReturnValueOnce(new Array(8).fill({}));
  delete process.env.WORKER_COUNT;

  const config = getRuntimeConfig();

  expect(config.workerCount).toBe(7);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand "src/!tests/unit-tests/0 - utils/runtimeConfig.test.ts"`  
Expected: FAIL because runtime config file is missing.

**Step 3: Write minimal implementation**

```ts
import os from 'os';

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const getRuntimeConfig = (): { workerCount: number } => {
  const cpuCount = os.cpus().length || 1;
  const defaultWorkerCount = Math.max(1, cpuCount - 1);
  const envValue = Number(process.env.WORKER_COUNT);
  const workerCount = Number.isFinite(envValue)
    ? clamp(envValue, 1, 64)
    : defaultWorkerCount;

  return { workerCount };
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --runInBand "src/!tests/unit-tests/0 - utils/runtimeConfig.test.ts"`  
Expected: PASS.

**Step 5: Commit**

```bash
git add "src/0 - utils/runtimeConfig.ts" "src/!tests/unit-tests/0 - utils/runtimeConfig.test.ts"
git commit --no-gpg-sign -m "feat: add runtime worker count configuration"
```

### Task 5: Refactor parseReplays to Use Worker Pool

**Files:**
- Modify: `src/1 - replays/parseReplays.ts`
- Modify: `src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/parseReplays.test.ts`

**Step 1: Write the failing test**

```ts
import WorkerPool from '../../../1 - replays/workers/workerPool';

jest.mock('../../../1 - replays/workers/workerPool');

test('parseReplays uses worker responses and ignores skipped/error', async () => {
  const runTask = jest.fn()
    .mockResolvedValueOnce({
      taskId: '1',
      status: 'success',
      data: { date: '2024-01-02', missionName: 'sg@a', result: [] },
    })
    .mockResolvedValueOnce({
      taskId: '2',
      status: 'skipped',
      filename: 'f2',
      reason: 'empty_replay',
    })
    .mockResolvedValueOnce({
      taskId: '3',
      status: 'error',
      error: { filename: 'f3', message: 'broken' },
    });

  (WorkerPool as unknown as jest.Mock).mockImplementation(() => ({
    runTask,
  }));

  const output = await parseReplays(
    [generateReplay('sg', 'f1'), generateReplay('sg', 'f2'), generateReplay('sg', 'f3')],
    'sg',
  );

  expect(output).toHaveLength(1);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand "src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/parseReplays.test.ts"`  
Expected: FAIL because `parseReplays` still uses main-thread parsing path.

**Step 3: Write minimal implementation**

```ts
import { orderBy } from 'lodash';

import logger from '../0 - utils/logger';
import type WorkerPool from './workers/workerPool';
import { ParseReplayWorkerResponse } from './workers/types';

const parseReplays = async (
  replays: Replay[],
  gameType: GameType,
  workerPool: WorkerPool,
): Promise<PlayersGameResult[]> => {
  const results = await Promise.all(
    replays.map((replay) => workerPool.runTask({
      filename: replay.filename,
      date: replay.date,
      missionName: replay.mission_name,
      gameType,
    })),
  );

  const parsed = results.reduce<PlayersGameResult[]>((acc, item: ParseReplayWorkerResponse) => {
    if (item.status === 'success') {
      acc.push(item.data);
      return acc;
    }

    if (item.status === 'error') {
      logger.error(
        `Error occurred during replay parsing. Replay: ${item.error.filename}; Error: ${item.error.message}; Trace: ${item.error.stack}`,
      );
    }

    return acc;
  }, []);

  return orderBy(parsed, 'date', 'asc');
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --runInBand "src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/parseReplays.test.ts"`  
Expected: PASS.

**Step 5: Commit**

```bash
git add "src/1 - replays/parseReplays.ts" "src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo/parseReplays.test.ts"
git commit --no-gpg-sign -m "refactor: route replay parsing through worker pool"
```

### Task 6: Create a Shared Pool in startParsingReplays

**Files:**
- Modify: `src/index.ts`
- Modify: `src/!tests/unit-tests/schedule.test.ts` (only if constructor path expectations require updates)

**Step 1: Write the failing test**

```ts
import WorkerPool from '../1 - replays/workers/workerPool';

jest.mock('../1 - replays/workers/workerPool');

test('startParsingReplays creates one shared worker pool and destroys it', async () => {
  const destroy = jest.fn().mockResolvedValue(undefined);
  (WorkerPool as unknown as jest.Mock).mockImplementation(() => ({ destroy }));

  await startParsingReplays();

  expect(WorkerPool).toHaveBeenCalledTimes(1);
  expect(destroy).toHaveBeenCalledTimes(1);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runInBand "src/!tests/unit-tests/schedule.test.ts"`  
Expected: FAIL because `startParsingReplays` does not instantiate shared pool.

**Step 3: Write minimal implementation**

```ts
import path from 'path';
import WorkerPool from './1 - replays/workers/workerPool';
import { getRuntimeConfig } from './0 - utils/runtimeConfig';

const startParsingReplays = async () => {
  const { workerCount } = getRuntimeConfig();
  const workerScriptPath = path.join(__dirname, '1 - replays/workers/parseReplayWorker.js');
  const workerPool = new WorkerPool({ workerCount, workerScriptPath });

  try {
    // existing flow, but pass workerPool to parseReplays/getParsedReplays
  } finally {
    await workerPool.destroy();
  }
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --runInBand "src/!tests/unit-tests/schedule.test.ts"`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/index.ts "src/!tests/unit-tests/schedule.test.ts"
git commit --no-gpg-sign -m "feat: use shared worker pool in replay parsing flow"
```

### Task 7: Full Verification and Documentation Refresh

**Files:**
- Modify: `docs/replay-parser-architecture.md` (if behavior sections became outdated)

**Step 1: Run focused test suite**

Run: `npm test -- --runInBand "src/!tests/unit-tests/1 - replays, 2 - parseReplayInfo"`  
Expected: PASS.

**Step 2: Run full test suite**

Run: `npm test`  
Expected: PASS, no regressions.

**Step 3: Verify build output includes worker entrypoint**

Run: `npm run build-dist`  
Expected: PASS and `dist/1 - replays/workers/parseReplayWorker.js` exists.

**Step 4: Refresh architecture document**

Update `docs/replay-parser-architecture.md`:
1. Replace per-replay parsing section to describe worker pool path.
2. Remove old `p-limit` CPU parsing description.
3. Add shared worker pool lifecycle in `startParsingReplays`.

**Step 5: Commit**

```bash
git add "docs/replay-parser-architecture.md"
git commit --no-gpg-sign -m "docs: update architecture for worker-based replay parsing"
```

### Task 8: Final Integration Commit

**Files:**
- All remaining worker-pool implementation files and tests

**Step 1: Check git status**

Run: `git status --short`  
Expected: only intended files changed.

**Step 2: Run final verification once more**

Run: `npm test && npm run build-dist`  
Expected: PASS.

**Step 3: Create integration commit**

```bash
git add .
git commit --no-gpg-sign -m "feat: implement worker pool replay parsing for all game types"
```

**Step 4: Capture summary for PR/changelog**

Include:
1. Why `p-limit` was removed from CPU path.
2. Shared-pool decision and impact.
3. Worker status contract (`success`, `skipped`, `error`).
4. Test evidence and build evidence.
