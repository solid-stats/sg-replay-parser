import Cron from 'croner';

import logger from '../../0 - utils/logger';
import {
  getSgZoneRequestQueueState,
  isCloudflareBanError,
  waitForSgZoneRequestQueueToDrain,
} from '../../0 - utils/request';
import generateMaceList from '../../jobs/generateMaceListHTML';
import generateMissionMakersList from '../../jobs/generateMissionMakersList';
import startFetchingReplays from '../../jobs/prepareReplaysList';

jest.mock('croner', () => jest.fn());
jest.mock('fs-extra', () => ({
  removeSync: jest.fn(),
}));
jest.mock('../../index', () => jest.fn());
jest.mock('../../0 - utils/generateBasicFolders', () => jest.fn());
jest.mock('../../jobs/generateMaceListHTML', () => jest.fn());
jest.mock('../../jobs/generateMissionMakersList', () => jest.fn());
jest.mock('../../jobs/prepareReplaysList', () => jest.fn());
jest.mock('../../0 - utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock('../../0 - utils/request', () => ({
  __esModule: true,
  getSgZoneRequestQueueState: jest.fn(),
  waitForSgZoneRequestQueueToDrain: jest.fn(),
  isCloudflareBanError: jest.fn(),
}));

type CronCallback = () => Promise<void> | void;

type RegisteredCronJob = {
  expression: string;
  callback: CronCallback;
};

const mockedCron = Cron as unknown as jest.Mock;
const mockedGenerateMissionMakersList = generateMissionMakersList as jest.MockedFunction<
  typeof generateMissionMakersList
>;
const mockedStartFetchingReplays = startFetchingReplays as jest.MockedFunction<
  typeof startFetchingReplays
>;
const mockedGenerateMaceList = generateMaceList as jest.MockedFunction<typeof generateMaceList>;
const mockedGetSgZoneRequestQueueState = getSgZoneRequestQueueState as jest.MockedFunction<
  typeof getSgZoneRequestQueueState
>;
const mockedWaitForSgZoneRequestQueueToDrain = (
  waitForSgZoneRequestQueueToDrain
) as jest.MockedFunction<typeof waitForSgZoneRequestQueueToDrain>;
const mockedIsCloudflareBanError = (
  isCloudflareBanError
) as jest.MockedFunction<typeof isCloudflareBanError>;
const mockedLogger = logger as unknown as {
  info: jest.Mock;
  error: jest.Mock;
};

const cronJobs: RegisteredCronJob[] = [];

const cloudflareBanError = (): Error => {
  const error = new Error('sg.zone request was blocked by Cloudflare');

  error.name = 'CloudflareBanError';

  return error;
};

const hasVerboseErrorLogs = (): boolean => (
  mockedLogger.error.mock.calls.some(
    ([message]) => /Trace:|stack:/i.test(String(message)),
  )
);

beforeAll(() => {
  mockedCron.mockImplementation((expression: string, _options: unknown, callback: CronCallback) => {
    cronJobs.push({ expression, callback });

    return {
      isBusy: jest.fn(() => false),
    };
  });

  // eslint-disable-next-line global-require
  require('../../schedule');
});

beforeEach(() => {
  mockedGenerateMissionMakersList.mockReset();
  mockedStartFetchingReplays.mockReset();
  mockedGenerateMaceList.mockReset();
  mockedGetSgZoneRequestQueueState.mockReset();
  mockedWaitForSgZoneRequestQueueToDrain.mockReset();
  mockedIsCloudflareBanError.mockReset();
  mockedLogger.info.mockReset();
  mockedLogger.error.mockReset();

  mockedGetSgZoneRequestQueueState.mockReturnValue({
    pending: 0,
    active: 0,
    total: 0,
  });
  mockedWaitForSgZoneRequestQueueToDrain.mockResolvedValue(undefined);
  mockedIsCloudflareBanError.mockImplementation((error) => (
    (error as Error | null)?.name === 'CloudflareBanError'
  ));
});

test('should log Cloudflare ban without stack trace in generateMissionMakersList scheduled job', async () => {
  const missionMakersCronJob = cronJobs[0];

  mockedGenerateMissionMakersList.mockRejectedValue(cloudflareBanError());

  await expect(missionMakersCronJob.callback()).resolves.toBeUndefined();

  expect(missionMakersCronJob.expression).toBe('5 */2 * * *');
  expect(mockedGenerateMissionMakersList).toHaveBeenCalledTimes(1);
  expect(mockedWaitForSgZoneRequestQueueToDrain).toHaveBeenCalledTimes(1);
  expect(mockedLogger.error).toHaveBeenCalledWith(expect.stringContaining('Cloudflare'));
  expect(hasVerboseErrorLogs()).toBe(false);
});

test('should stop startFetchingReplays scheduled job flow on Cloudflare ban and skip mace list generation', async () => {
  const fetchReplaysCronJob = cronJobs[1];

  mockedStartFetchingReplays.mockRejectedValue(cloudflareBanError());

  await expect(fetchReplaysCronJob.callback()).resolves.toBeUndefined();

  expect(fetchReplaysCronJob.expression).toBe('5 */2 * * *');
  expect(mockedStartFetchingReplays).toHaveBeenCalledTimes(1);
  expect(mockedGenerateMaceList).not.toHaveBeenCalled();
  expect(mockedLogger.error).toHaveBeenCalledWith(expect.stringContaining('Cloudflare'));
  expect(hasVerboseErrorLogs()).toBe(false);
});

test('should keep mace list generation for non-Cloudflare startFetchingReplays errors', async () => {
  const fetchReplaysCronJob = cronJobs[1];

  mockedStartFetchingReplays.mockRejectedValue(new Error('Unknown parsing failure'));

  await expect(fetchReplaysCronJob.callback()).resolves.toBeUndefined();

  expect(mockedStartFetchingReplays).toHaveBeenCalledTimes(1);
  expect(mockedGenerateMaceList).toHaveBeenCalledTimes(1);
  expect(mockedLogger.error).toHaveBeenCalledWith(expect.stringContaining('Trace:'));
});
