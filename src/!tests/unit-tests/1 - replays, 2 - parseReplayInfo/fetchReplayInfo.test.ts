import path from 'path';

import fs from 'fs-extra';

import logger from '../../../0 - utils/logger';
import { rawReplaysPath } from '../../../0 - utils/paths';
import fetchReplayInfo from '../../../1 - replays/fetchReplayInfo';

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

const mockedLogger = logger as unknown as { error: jest.Mock };

beforeEach(() => {
  jest.restoreAllMocks();
  mockedLogger.error.mockReset();
});

test('fetchReplayInfo should return parsed replay JSON', async () => {
  const replayData: ReplayInfo = {
    playersCount: [10, 0, 10, 0],
    endFrame: 100,
    captureDelay: 5,
    events: [],
    entities: [],
    EditorMarkers: [],
    Markers: [],
    missionAuthor: 'author',
    missionName: 'test',
    worldName: 'unknown',
  };

  jest.spyOn(fs, 'readJson').mockResolvedValue(replayData);

  const result = await fetchReplayInfo('test_file');

  expect(fs.readJson).toHaveBeenCalledWith(path.join(rawReplaysPath, 'test_file.json'));
  expect(result).toEqual(replayData);
});

test('fetchReplayInfo should return null and log error on read failure', async () => {
  jest.spyOn(fs, 'readJson').mockRejectedValue(new Error('File not found'));

  const result = await fetchReplayInfo('missing_file');

  expect(result).toBeNull();
  expect(mockedLogger.error).toHaveBeenCalledTimes(1);
  expect(mockedLogger.error).toHaveBeenCalledWith(expect.stringContaining('missing_file'));
});
