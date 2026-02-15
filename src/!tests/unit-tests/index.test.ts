import fs from 'fs-extra';

import logger from '../../0 - utils/logger';
import { commitParsingStatus, readRunReplayListPreparedAt } from '../../0 - utils/parsingStatus';
import generateOutput from '../../4 - output';
import startParsingReplays from '../../index';

jest.mock('fs-extra', () => ({
  emptyDirSync: jest.fn(),
}));

jest.mock('../../0 - utils/generateBasicFolders', () => jest.fn());
jest.mock('../../0 - utils/namesHelper/prepareNamesList', () => ({
  prepareNamesList: jest.fn(),
}));
jest.mock('../../0 - utils/runtimeConfig', () => ({
  getRuntimeConfig: jest.fn(() => ({ workerCount: 1 })),
}));

jest.mock('../../1 - replays/getReplays', () => jest.fn(async () => []));
jest.mock('../../1 - replays/parseReplays', () => jest.fn(async () => []));

jest.mock('../../1 - replays/workers/workerPool', () => ({
  WorkerPool: jest.fn().mockImplementation(() => ({
    destroy: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('../../3 - statistics/global', () => jest.fn(() => []));
jest.mock('../../3 - statistics/rotations', () => jest.fn(() => null));
jest.mock('../../4 - output', () => jest.fn(async () => undefined));

jest.mock('../../0 - utils/parsingStatus', () => ({
  readRunReplayListPreparedAt: jest.fn(() => '2026-02-15T10:00:00.000Z'),
  commitParsingStatus: jest.fn(),
}));

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

const mockedFs = fs as unknown as {
  emptyDirSync: jest.Mock;
};

const mockedGenerateOutput = generateOutput as jest.MockedFunction<typeof generateOutput>;
const mockedReadRunReplayListPreparedAt = (
  readRunReplayListPreparedAt
) as jest.MockedFunction<typeof readRunReplayListPreparedAt>;
const mockedCommitParsingStatus = commitParsingStatus as jest.MockedFunction<
  typeof commitParsingStatus
>;

const mockedLogger = logger as unknown as {
  info: jest.Mock;
};

describe('startParsingReplays parsing status commit', () => {
  beforeEach(() => {
    mockedFs.emptyDirSync.mockReset();
    mockedGenerateOutput.mockReset().mockResolvedValue(undefined);
    mockedReadRunReplayListPreparedAt.mockReset().mockReturnValue('2026-02-15T10:00:00.000Z');
    mockedCommitParsingStatus.mockReset();
    mockedLogger.info.mockReset();
  });

  test('commits parsing status after successful output generation', async () => {
    await startParsingReplays();

    expect(mockedReadRunReplayListPreparedAt).toHaveBeenCalledTimes(1);
    expect(mockedGenerateOutput).toHaveBeenCalledTimes(1);
    expect(mockedCommitParsingStatus).toHaveBeenCalledWith('2026-02-15T10:00:00.000Z');
    expect(mockedCommitParsingStatus.mock.invocationCallOrder[0]).toBeGreaterThan(
      mockedGenerateOutput.mock.invocationCallOrder[0],
    );
  });

  test('does not commit parsing status when output generation fails', async () => {
    mockedGenerateOutput.mockRejectedValue(new Error('output failed'));

    await expect(startParsingReplays()).rejects.toThrow('output failed');

    expect(mockedReadRunReplayListPreparedAt).toHaveBeenCalledTimes(1);
    expect(mockedCommitParsingStatus).not.toHaveBeenCalled();
  });

  test('does not commit parsing status when run snapshot is missing', async () => {
    mockedReadRunReplayListPreparedAt.mockReturnValue(null);

    await startParsingReplays();

    expect(mockedGenerateOutput).toHaveBeenCalledTimes(1);
    expect(mockedCommitParsingStatus).not.toHaveBeenCalled();
  });
});
