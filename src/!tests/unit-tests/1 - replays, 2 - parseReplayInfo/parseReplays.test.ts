import logger from '../../../0 - utils/logger';
import parseReplays from '../../../1 - replays/parseReplays';
import { ParseReplayTaskResponseMessage } from '../../../1 - replays/workers/types';
import generateReplay from '../../utils/generators/generateReplay';

jest.mock('../../../0 - utils/logger', () => ({
  __esModule: true,
  default: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
}));

type WorkerPoolMock = {
  runTask: jest.Mock<Promise<ParseReplayTaskResponseMessage>, [{
    filename: Replay['filename'];
    date: Replay['date'];
    missionName: Replay['mission_name'];
    gameType: GameType;
  }]>;
};

const createWorkerPoolMock = (): WorkerPoolMock => ({
  runTask: jest.fn(),
});

beforeEach(() => {
  jest.clearAllMocks();
});

test('parseReplays should submit tasks, ignore skipped and keep success results sorted by date', async () => {
  const replays = [
    generateReplay('sg', 'file_3', '2024-03-03T00:00:00.000Z'),
    generateReplay('sg', 'file_1', '2024-01-01T00:00:00.000Z'),
    generateReplay('sg', 'file_2', '2024-02-02T00:00:00.000Z'),
  ];
  const workerPool = createWorkerPoolMock();

  workerPool.runTask
    .mockResolvedValueOnce({
      taskId: 'task-1',
      status: 'success',
      data: {
        date: replays[0].date,
        missionName: replays[0].mission_name,
        result: [],
      },
    })
    .mockResolvedValueOnce({
      taskId: 'task-2',
      status: 'skipped',
      filename: replays[1].filename,
      reason: 'empty_replay',
    })
    .mockResolvedValueOnce({
      taskId: 'task-3',
      status: 'success',
      data: {
        date: replays[2].date,
        missionName: replays[2].mission_name,
        result: [],
      },
    });

  const parsedReplays = await parseReplays(replays, 'sg', workerPool);

  expect(workerPool.runTask).toHaveBeenCalledTimes(3);
  expect(workerPool.runTask).toHaveBeenNthCalledWith(1, {
    filename: replays[0].filename,
    date: replays[0].date,
    missionName: replays[0].mission_name,
    gameType: 'sg',
  });
  expect(workerPool.runTask).toHaveBeenNthCalledWith(2, {
    filename: replays[1].filename,
    date: replays[1].date,
    missionName: replays[1].mission_name,
    gameType: 'sg',
  });
  expect(workerPool.runTask).toHaveBeenNthCalledWith(3, {
    filename: replays[2].filename,
    date: replays[2].date,
    missionName: replays[2].mission_name,
    gameType: 'sg',
  });

  expect(parsedReplays).toEqual([
    {
      date: replays[2].date,
      missionName: replays[2].mission_name,
      result: [],
    },
    {
      date: replays[0].date,
      missionName: replays[0].mission_name,
      result: [],
    },
  ]);
});

test('parseReplays should log worker errors and omit error responses from output', async () => {
  const replay = generateReplay('sg', 'file_error', '2024-04-04T00:00:00.000Z');
  const workerPool = createWorkerPoolMock();

  workerPool.runTask.mockResolvedValueOnce({
    taskId: 'task-1',
    status: 'error',
    error: {
      filename: replay.filename,
      message: 'worker failed',
      stack: 'stack trace',
    },
  });

  const parsedReplays = await parseReplays([replay], 'sg', workerPool);

  expect(parsedReplays).toEqual([]);
  expect(logger.warn).toHaveBeenCalledTimes(1);
  expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('worker failed'));
  expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining(replay.filename));
});

test('parseReplays should invoke progress callback for each replay', async () => {
  const replays = [
    generateReplay('sg', 'file_1', '2024-01-01T00:00:00.000Z'),
    generateReplay('sg', 'file_2', '2024-02-02T00:00:00.000Z'),
  ];
  const workerPool = createWorkerPoolMock();
  const onProgress = jest.fn();

  workerPool.runTask
    .mockResolvedValueOnce({
      taskId: 'task-1',
      status: 'success',
      data: {
        date: replays[0].date,
        missionName: replays[0].mission_name,
        result: [],
      },
    })
    .mockResolvedValueOnce({
      taskId: 'task-2',
      status: 'success',
      data: {
        date: replays[1].date,
        missionName: replays[1].mission_name,
        result: [],
      },
    });

  await parseReplays(replays, 'sg', workerPool, onProgress);

  expect(onProgress).toHaveBeenCalledTimes(2);
});
