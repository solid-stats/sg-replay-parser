import { EventEmitter } from 'events';

import {
  ParseReplayTaskMessage,
  ParseReplayTaskResponseMessage,
} from '../../../../1 - replays/workers/types';
import { WorkerPool } from '../../../../1 - replays/workers/workerPool';

type MockWorker = EventEmitter & {
  scriptPath: string;
  postedMessages: unknown[];
  terminate: jest.Mock<Promise<void>, []>;
  postMessage: jest.Mock<void, [unknown]>;
};

const mockWorkerInstances: MockWorker[] = [];

jest.mock('worker_threads', () => ({
  Worker: class Worker extends EventEmitter {
    public readonly scriptPath: string;

    public readonly postedMessages: unknown[] = [];

    public terminate = jest.fn(async () => undefined);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(scriptPath: string, _options?: Record<string, unknown>) {
      super();

      this.scriptPath = scriptPath;
      mockWorkerInstances.push(this as unknown as MockWorker);
    }

    public postMessage = jest.fn((message: unknown): void => {
      this.postedMessages.push(message);
    });
  },
}));

const getPostedTask = (worker: MockWorker, index = 0): ParseReplayTaskMessage => (
  worker.postedMessages[index] as ParseReplayTaskMessage
);

beforeEach(() => {
  mockWorkerInstances.length = 0;
  jest.clearAllMocks();
});

afterEach(async () => {
  const activeInstances = [...mockWorkerInstances];

  await Promise.all(activeInstances.map((worker) => worker.terminate()));
});

test('WorkerPool should process queued tasks with fixed worker count', async () => {
  const pool = new WorkerPool({
    workerCount: 1,
    workerScriptPath: '/tmp/parseReplayWorker.js',
  });

  expect(mockWorkerInstances).toHaveLength(1);

  const firstTaskPromise = pool.runTask({
    filename: 'file-1',
    date: '2024-01-01',
    missionName: 'sg@mission_1',
    gameType: 'sg',
  });
  const secondTaskPromise = pool.runTask({
    filename: 'file-2',
    date: '2024-01-02',
    missionName: 'sg@mission_2',
    gameType: 'sg',
  });

  const worker = mockWorkerInstances[0];

  expect(worker.postedMessages).toHaveLength(1);

  const firstTask = getPostedTask(worker, 0);

  worker.emit('message', {
    taskId: firstTask.taskId,
    status: 'success',
    data: {
      date: '2024-01-01',
      missionName: 'sg@mission_1',
      result: [],
    },
  } as ParseReplayTaskResponseMessage);

  expect(worker.postedMessages).toHaveLength(2);

  const secondTask = getPostedTask(worker, 1);

  worker.emit('message', {
    taskId: secondTask.taskId,
    status: 'skipped',
    filename: 'file-2',
    reason: 'empty_replay',
  } as ParseReplayTaskResponseMessage);

  await expect(firstTaskPromise).resolves.toMatchObject({
    taskId: firstTask.taskId,
    status: 'success',
  });
  await expect(secondTaskPromise).resolves.toMatchObject({
    taskId: secondTask.taskId,
    status: 'skipped',
    reason: 'empty_replay',
  });

  await pool.destroy();
});

test('WorkerPool should route responses by taskId', async () => {
  const pool = new WorkerPool({
    workerCount: 2,
    workerScriptPath: '/tmp/parseReplayWorker.js',
  });

  const firstPromise = pool.runTask({
    filename: 'file-a',
    date: '2024-01-01',
    missionName: 'sg@mission_a',
    gameType: 'sg',
  });
  const secondPromise = pool.runTask({
    filename: 'file-b',
    date: '2024-01-02',
    missionName: 'sg@mission_b',
    gameType: 'sg',
  });

  const [firstWorker, secondWorker] = mockWorkerInstances;
  const firstTask = getPostedTask(firstWorker);
  const secondTask = getPostedTask(secondWorker);

  secondWorker.emit('message', {
    taskId: secondTask.taskId,
    status: 'skipped',
    filename: 'file-b',
    reason: 'mace_min_players',
  } as ParseReplayTaskResponseMessage);

  firstWorker.emit('message', {
    taskId: firstTask.taskId,
    status: 'success',
    data: {
      date: '2024-01-01',
      missionName: 'sg@mission_a',
      result: [],
    },
  } as ParseReplayTaskResponseMessage);

  await expect(firstPromise).resolves.toMatchObject({
    taskId: firstTask.taskId,
    status: 'success',
  });
  await expect(secondPromise).resolves.toMatchObject({
    taskId: secondTask.taskId,
    status: 'skipped',
    reason: 'mace_min_players',
  });

  await pool.destroy();
});

test('WorkerPool should resolve active task with error when worker fails and continue queued tasks', async () => {
  const pool = new WorkerPool({
    workerCount: 1,
    workerScriptPath: '/tmp/parseReplayWorker.js',
  });

  const firstPromise = pool.runTask({
    filename: 'file-active',
    date: '2024-01-01',
    missionName: 'sg@active',
    gameType: 'sg',
  });
  const secondPromise = pool.runTask({
    filename: 'file-queued',
    date: '2024-01-02',
    missionName: 'sg@queued',
    gameType: 'sg',
  });

  const failedWorker = mockWorkerInstances[0];
  const activeTask = getPostedTask(failedWorker);

  failedWorker.emit('error', 'worker crashed');

  await expect(firstPromise).resolves.toMatchObject({
    taskId: activeTask.taskId,
    status: 'error',
    error: {
      filename: 'file-active',
      message: 'worker crashed',
    },
  });

  expect(failedWorker.terminate).toBeCalledTimes(1);

  failedWorker.emit('exit', 1);

  expect(mockWorkerInstances).toHaveLength(2);

  const recoveredWorker = mockWorkerInstances[1];
  const queuedTask = getPostedTask(recoveredWorker);

  recoveredWorker.emit('message', {
    taskId: queuedTask.taskId,
    status: 'success',
    data: {
      date: '2024-01-02',
      missionName: 'sg@queued',
      result: [],
    },
  } as ParseReplayTaskResponseMessage);

  await expect(secondPromise).resolves.toMatchObject({
    taskId: queuedTask.taskId,
    status: 'success',
  });

  await pool.destroy();
});

test('WorkerPool should resolve active task with exit error on abnormal worker exit', async () => {
  const pool = new WorkerPool({
    workerCount: 1,
    workerScriptPath: '/tmp/parseReplayWorker.js',
  });

  const taskPromise = pool.runTask({
    filename: 'file-exit',
    date: '2024-01-01',
    missionName: 'sg@exit',
    gameType: 'sg',
  });

  const worker = mockWorkerInstances[0];
  const activeTask = getPostedTask(worker);

  worker.emit('exit', 2);

  await expect(taskPromise).resolves.toMatchObject({
    taskId: activeTask.taskId,
    status: 'error',
    error: {
      filename: 'file-exit',
      message: 'Worker exited with code 2',
    },
  });

  await pool.destroy();
});

test('WorkerPool should resolve active task with error on zero exit code', async () => {
  const pool = new WorkerPool({
    workerCount: 1,
    workerScriptPath: '/tmp/parseReplayWorker.js',
  });

  const taskPromise = pool.runTask({
    filename: 'file-exit-zero',
    date: '2024-01-01',
    missionName: 'sg@exit_zero',
    gameType: 'sg',
  });

  const worker = mockWorkerInstances[0];
  const activeTask = getPostedTask(worker);

  worker.emit('exit', 0);

  await expect(taskPromise).resolves.toMatchObject({
    taskId: activeTask.taskId,
    status: 'error',
    error: {
      filename: 'file-exit-zero',
      message: 'Worker exited with code 0',
    },
  });

  await pool.destroy();
});

test('WorkerPool should ignore unknown responses and keep processing active task', async () => {
  const pool = new WorkerPool({
    workerCount: 1,
    workerScriptPath: '/tmp/parseReplayWorker.js',
  });

  const taskPromise = pool.runTask({
    filename: 'file-known',
    date: '2024-01-01',
    missionName: 'sg@known',
    gameType: 'sg',
  });

  const worker = mockWorkerInstances[0];
  const activeTask = getPostedTask(worker);

  worker.emit('message', {
    taskId: 'task-unknown',
    status: 'error',
    error: {
      filename: 'file-unknown',
      message: 'unknown',
    },
  } as ParseReplayTaskResponseMessage);

  expect(worker.postedMessages).toHaveLength(1);

  worker.emit('message', {
    taskId: activeTask.taskId,
    status: 'success',
    data: {
      date: '2024-01-01',
      missionName: 'sg@known',
      result: [],
    },
  } as ParseReplayTaskResponseMessage);

  await expect(taskPromise).resolves.toMatchObject({
    taskId: activeTask.taskId,
    status: 'success',
  });

  await pool.destroy();
});

test('WorkerPool should resolve task as error when postMessage throws and continue queue', async () => {
  const pool = new WorkerPool({
    workerCount: 1,
    workerScriptPath: '/tmp/parseReplayWorker.js',
  });

  const worker = mockWorkerInstances[0];

  worker.postMessage.mockImplementationOnce(() => {
    throw new Error('post failed');
  });

  const firstPromise = pool.runTask({
    filename: 'file-post-failed',
    date: '2024-01-01',
    missionName: 'sg@post_failed',
    gameType: 'sg',
  });
  const secondPromise = pool.runTask({
    filename: 'file-post-next',
    date: '2024-01-02',
    missionName: 'sg@post_next',
    gameType: 'sg',
  });

  await expect(firstPromise).resolves.toMatchObject({
    status: 'error',
    error: {
      filename: 'file-post-failed',
      message: 'post failed',
    },
  });

  expect(worker.postedMessages).toHaveLength(1);

  const secondTask = getPostedTask(worker, 0);

  worker.emit('message', {
    taskId: secondTask.taskId,
    status: 'success',
    data: {
      date: '2024-01-02',
      missionName: 'sg@post_next',
      result: [],
    },
  } as ParseReplayTaskResponseMessage);

  await expect(secondPromise).resolves.toMatchObject({
    taskId: secondTask.taskId,
    status: 'success',
  });

  await pool.destroy();
});

test('WorkerPool destroy should terminate all workers', async () => {
  const pool = new WorkerPool({
    workerCount: 3,
    workerScriptPath: '/tmp/parseReplayWorker.js',
  });

  const workers = [...mockWorkerInstances];

  await pool.destroy();

  workers.forEach((worker) => {
    expect(worker.terminate).toBeCalledTimes(1);
  });
});

test('WorkerPool destroy should resolve queued and in-flight tasks as errors and reject new tasks', async () => {
  const pool = new WorkerPool({
    workerCount: 1,
    workerScriptPath: '/tmp/parseReplayWorker.js',
  });

  const inFlightTask = pool.runTask({
    filename: 'file-in-flight',
    date: '2024-01-01',
    missionName: 'sg@in_flight',
    gameType: 'sg',
  });
  const queuedTask = pool.runTask({
    filename: 'file-queued-on-destroy',
    date: '2024-01-02',
    missionName: 'sg@queued_destroy',
    gameType: 'sg',
  });

  await pool.destroy();

  await expect(inFlightTask).resolves.toMatchObject({
    status: 'error',
    error: {
      filename: 'file-in-flight',
      message: 'WorkerPool destroyed',
    },
  });
  await expect(queuedTask).resolves.toMatchObject({
    status: 'error',
    error: {
      filename: 'file-queued-on-destroy',
      message: 'WorkerPool destroyed',
    },
  });

  await expect(pool.runTask({
    filename: 'file-after-destroy',
    date: '2024-01-03',
    missionName: 'sg@after_destroy',
    gameType: 'sg',
  })).rejects.toThrow('WorkerPool is destroyed');
});

test('WorkerPool should throw on non-positive workerCount', () => {
  expect(() => new WorkerPool({
    workerCount: 0,
    workerScriptPath: '/tmp/parseReplayWorker.js',
  })).toThrow('WorkerPool workerCount must be greater than 0');
});

test('WorkerPool should recover when worker has stale active task marker on exit', async () => {
  const pool = new WorkerPool({
    workerCount: 1,
    workerScriptPath: '/tmp/parseReplayWorker.js',
  });

  const worker = mockWorkerInstances[0];
  const { workerActiveTaskId } = (
    pool as unknown as { workerActiveTaskId: Map<MockWorker, string | null> }
  );

  workerActiveTaskId.set(worker, 'task-missing-from-inflight');

  worker.emit('exit', 1);

  expect(mockWorkerInstances).toHaveLength(2);

  const recoveredWorker = mockWorkerInstances[1];
  const taskPromise = pool.runTask({
    filename: 'file-after-stale-marker',
    date: '2024-01-01',
    missionName: 'sg@after_stale_marker',
    gameType: 'sg',
  });
  const postedTask = getPostedTask(recoveredWorker);

  recoveredWorker.emit('message', {
    taskId: postedTask.taskId,
    status: 'success',
    data: {
      date: '2024-01-01',
      missionName: 'sg@after_stale_marker',
      result: [],
    },
  } as ParseReplayTaskResponseMessage);

  await expect(taskPromise).resolves.toMatchObject({
    taskId: postedTask.taskId,
    status: 'success',
  });

  await pool.destroy();
});
