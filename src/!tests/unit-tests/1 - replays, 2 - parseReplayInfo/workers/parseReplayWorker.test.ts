import path from 'path';

import fs from 'fs-extra';

import { rawReplaysPath } from '../../../../0 - utils/paths';
import { runParseTask } from '../../../../1 - replays/workers/parseReplayWorker';
import { ParseReplayTaskMessage } from '../../../../1 - replays/workers/types';
import * as parseReplayInfoModule from '../../../../2 - parseReplayInfo';

const getTask = (gameType: GameType): ParseReplayTaskMessage => ({
  taskId: 'task-1',
  filename: 'file_1',
  date: '2024-01-01',
  missionName: 'sg@test_mission',
  gameType,
});

const createPlayersMap = (count: number): PlayersList => {
  const playersMap = {} as PlayersList;

  for (let index = 0; index < count; index += 1) {
    playersMap[index] = { id: index } as PlayerInfo;
  }

  return playersMap;
};

beforeEach(() => {
  jest.restoreAllMocks();
});

test('runParseTask should return success response', async () => {
  jest.spyOn(fs, 'readJson').mockResolvedValueOnce({} as ReplayInfo);
  jest.spyOn(parseReplayInfoModule, 'default').mockReturnValueOnce(createPlayersMap(2));

  const response = await runParseTask(getTask('sg'));

  expect(fs.readJson).toBeCalledWith(path.join(rawReplaysPath, 'file_1.json'));
  expect(parseReplayInfoModule.default).toBeCalledWith({}, '2024-01-01');

  expect(response.status).toBe('success');

  if (response.status === 'success') {
    expect(response.taskId).toBe('task-1');
    expect(response.data.date).toBe('2024-01-01');
    expect(response.data.missionName).toBe('sg@test_mission');
    expect(response.data.result).toHaveLength(2);
  }
});

test('runParseTask should skip empty replay', async () => {
  jest.spyOn(fs, 'readJson').mockResolvedValueOnce({} as ReplayInfo);
  jest.spyOn(parseReplayInfoModule, 'default').mockReturnValueOnce({});

  const response = await runParseTask(getTask('sg'));

  expect(response).toMatchObject({
    taskId: 'task-1',
    status: 'skipped',
    filename: 'file_1',
    reason: 'empty_replay',
  });
});

test('runParseTask should skip mace replay with less than 10 players', async () => {
  jest.spyOn(fs, 'readJson').mockResolvedValueOnce({} as ReplayInfo);
  jest.spyOn(parseReplayInfoModule, 'default').mockReturnValueOnce(createPlayersMap(9));

  const response = await runParseTask(getTask('mace'));

  expect(response).toMatchObject({
    taskId: 'task-1',
    status: 'skipped',
    filename: 'file_1',
    reason: 'mace_min_players',
  });
});

test('runParseTask should return success for mace replay with exactly 10 players', async () => {
  jest.spyOn(fs, 'readJson').mockResolvedValueOnce({} as ReplayInfo);
  jest.spyOn(parseReplayInfoModule, 'default').mockReturnValueOnce(createPlayersMap(10));

  const response = await runParseTask(getTask('mace'));

  expect(response.status).toBe('success');

  if (response.status === 'success') {
    expect(response.taskId).toBe('task-1');
    expect(response.data.result).toHaveLength(10);
  }
});

test('runParseTask should return error response when replay read throws non Error value', async () => {
  jest.spyOn(fs, 'readJson').mockRejectedValueOnce('read failed');

  const response = await runParseTask(getTask('sg'));

  expect(response.status).toBe('error');

  if (response.status === 'error') {
    expect(response.taskId).toBe('task-1');
    expect(response.error.filename).toBe('file_1');
    expect(response.error.message).toBe('read failed');
  }
});

test('runParseTask should return error response when parsing throws', async () => {
  jest.spyOn(fs, 'readJson').mockResolvedValueOnce({} as ReplayInfo);
  jest.spyOn(parseReplayInfoModule, 'default').mockImplementationOnce(() => {
    throw new Error('parse failed');
  });

  const response = await runParseTask(getTask('sg'));

  expect(response.status).toBe('error');

  if (response.status === 'error') {
    expect(response.taskId).toBe('task-1');
    expect(response.error.filename).toBe('file_1');
    expect(response.error.message).toBe('parse failed');
  }
});

test('worker thread listener should post task response', async () => {
  try {
    jest.resetModules();

    const on = jest.fn();
    const postMessage = jest.fn();
    const mockedReadJson = jest.fn().mockResolvedValue({});
    const mockedParseReplayInfo = jest.fn().mockReturnValue(createPlayersMap(1));

    jest.doMock('worker_threads', () => ({
      parentPort: {
        on,
        postMessage,
      },
    }));
    jest.doMock('fs-extra', () => ({
      __esModule: true,
      default: {
        readJson: mockedReadJson,
      },
    }));
    jest.doMock('../../../../0 - utils/paths', () => ({
      rawReplaysPath: '/tmp/raw_replays',
    }));
    jest.doMock('../../../../2 - parseReplayInfo', () => ({
      __esModule: true,
      default: mockedParseReplayInfo,
    }));

    await import('../../../../1 - replays/workers/parseReplayWorker');

    expect(on).toBeCalledTimes(1);

    const messageHandler = on.mock.calls[0][1] as (
      task: ParseReplayTaskMessage
    ) => Promise<void>;

    await messageHandler(getTask('sg'));

    expect(mockedReadJson).toBeCalledWith('/tmp/raw_replays/file_1.json');
    expect(postMessage).toBeCalledWith(expect.objectContaining({
      taskId: 'task-1',
      status: 'success',
    }));
  } finally {
    jest.dontMock('worker_threads');
    jest.dontMock('fs-extra');
    jest.dontMock('../../../../0 - utils/paths');
    jest.dontMock('../../../../2 - parseReplayInfo');
    jest.resetModules();
  }
});

test('worker thread listener should handle postMessage throw without unhandled rejection', async () => {
  try {
    jest.resetModules();

    const on = jest.fn();
    const postMessage = jest.fn()
      .mockImplementationOnce(() => {
        throw new Error('post failed');
      })
      .mockImplementationOnce(() => undefined);
    const mockedReadJson = jest.fn().mockResolvedValue({});
    const mockedParseReplayInfo = jest.fn().mockReturnValue(createPlayersMap(1));

    jest.doMock('worker_threads', () => ({
      parentPort: {
        on,
        postMessage,
      },
    }));
    jest.doMock('fs-extra', () => ({
      __esModule: true,
      default: {
        readJson: mockedReadJson,
      },
    }));
    jest.doMock('../../../../0 - utils/paths', () => ({
      rawReplaysPath: '/tmp/raw_replays',
    }));
    jest.doMock('../../../../2 - parseReplayInfo', () => ({
      __esModule: true,
      default: mockedParseReplayInfo,
    }));

    await import('../../../../1 - replays/workers/parseReplayWorker');

    const messageHandler = on.mock.calls[0][1] as (
      task: ParseReplayTaskMessage
    ) => Promise<void>;

    await expect(messageHandler(getTask('sg'))).resolves.toBeUndefined();
    expect(postMessage).toBeCalledTimes(2);
    expect(postMessage.mock.calls[1][0]).toMatchObject({
      taskId: 'task-1',
      status: 'error',
      error: {
        filename: 'file_1',
        message: 'post failed',
      },
    });
  } finally {
    jest.dontMock('worker_threads');
    jest.dontMock('fs-extra');
    jest.dontMock('../../../../0 - utils/paths');
    jest.dontMock('../../../../2 - parseReplayInfo');
    jest.resetModules();
  }
});
