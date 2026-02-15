import Cron from 'croner';
import fs from 'fs-extra';

import logger from '../../0 - utils/logger';
import { resetNamesList } from '../../0 - utils/namesHelper';
import request, {
  isCloudflareBanError,
} from '../../0 - utils/request';
import startParsingReplays from '../../index';
import generateMaceList from '../../jobs/generateMaceListHTML';
import generateMissionMakersList from '../../jobs/generateMissionMakersList';
import startFetchingReplays from '../../jobs/prepareReplaysList';

jest.mock('croner', () => jest.fn());
jest.mock('fs-extra', () => ({
  removeSync: jest.fn(),
  ensureDirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));
jest.mock('../../index', () => jest.fn());
jest.mock('../../0 - utils/generateBasicFolders', () => jest.fn());
jest.mock('../../0 - utils/namesHelper', () => ({
  __esModule: true,
  resetNamesList: jest.fn(),
}));
jest.mock('../../jobs/generateMaceListHTML', () => jest.fn());
jest.mock('../../jobs/generateMissionMakersList', () => jest.fn());
jest.mock('../../jobs/prepareReplaysList', () => jest.fn());
jest.mock('../../0 - utils/logger', () => ({
  __esModule: true,
  default: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
}));
jest.mock('../../0 - utils/request', () => ({
  __esModule: true,
  default: jest.fn(),
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
const mockedStartParsingReplays = startParsingReplays as jest.MockedFunction<
  typeof startParsingReplays
>;
const mockedStartFetchingReplays = startFetchingReplays as jest.MockedFunction<
  typeof startFetchingReplays
>;
const mockedGenerateMaceList = generateMaceList as jest.MockedFunction<typeof generateMaceList>;
const mockedRequest = request as jest.MockedFunction<typeof request>;
const mockedResetNamesList = resetNamesList as jest.MockedFunction<typeof resetNamesList>;
const mockedIsCloudflareBanError = (
  isCloudflareBanError
) as jest.MockedFunction<typeof isCloudflareBanError>;
const mockedLogger = logger as unknown as {
  info: jest.Mock;
  error: jest.Mock;
  fatal: jest.Mock;
};
const mockedFs = fs as unknown as {
  removeSync: jest.Mock;
  ensureDirSync: jest.Mock;
  writeFileSync: jest.Mock;
};

const cronJobs: RegisteredCronJob[] = [];
const nameChangesCsvURL = 'https://docs.google.com/spreadsheets/d/1d2XHhGC0S0QgSegwL4HF279PLjH6fJzPJfTVLSrgpGQ/gviz/tq?tqx=out:csv&sheet=%D0%9F%D0%B5%D1%80%D0%B5%D0%BD%D0%BE%D1%81%20%D1%81%D1%82%D0%B0%D1%82%D0%B8%D1%81%D1%82%D0%B8%D0%BA%D0%B8%20%D0%BD%D0%B0%20%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9%20%D0%BF%D0%BE%D0%B7%D1%8B%D0%B2%D0%BD%D0%BE%D0%B9';

const cloudflareBanError = (): Error => {
  const error = new Error('sg.zone request was blocked by Cloudflare');

  error.name = 'CloudflareBanError';

  return error;
};

const hasVerboseErrorLogs = (): boolean => (
  mockedLogger.fatal.mock.calls.some(
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
  mockedStartParsingReplays.mockReset();
  mockedStartFetchingReplays.mockReset();
  mockedGenerateMaceList.mockReset();
  mockedRequest.mockReset();
  mockedResetNamesList.mockReset();
  mockedIsCloudflareBanError.mockReset();
  mockedLogger.info.mockReset();
  mockedLogger.error.mockReset();
  mockedLogger.fatal.mockReset();
  mockedFs.removeSync.mockReset();
  mockedFs.ensureDirSync.mockReset();
  mockedFs.writeFileSync.mockReset();

  mockedRequest.mockResolvedValue({
    text: jest.fn().mockResolvedValue(''),
  } as never);
  mockedStartParsingReplays.mockResolvedValue(undefined);
  mockedIsCloudflareBanError.mockImplementation((error) => (
    (error as Error | null)?.name === 'CloudflareBanError'
  ));
});

test('should log Cloudflare ban without stack trace in generateMissionMakersList scheduled job', async () => {
  const missionMakersCronJob = cronJobs[0];

  mockedGenerateMissionMakersList.mockRejectedValue(cloudflareBanError());

  await expect(missionMakersCronJob.callback()).resolves.toBeUndefined();

  expect(missionMakersCronJob.expression).toBe('0 */1 * * *');
  expect(mockedGenerateMissionMakersList).toHaveBeenCalledTimes(1);
  expect(mockedLogger.fatal).toHaveBeenCalledWith(expect.stringContaining('Cloudflare'));
  expect(hasVerboseErrorLogs()).toBe(false);
});

test('should stop startFetchingReplays scheduled job flow on Cloudflare ban and skip mace list generation', async () => {
  const fetchReplaysCronJob = cronJobs[1];

  mockedStartFetchingReplays.mockRejectedValue(cloudflareBanError());

  await expect(fetchReplaysCronJob.callback()).resolves.toBeUndefined();

  expect(fetchReplaysCronJob.expression).toBe('0 */1 * * *');
  expect(mockedStartFetchingReplays).toHaveBeenCalledTimes(1);
  expect(mockedGenerateMaceList).not.toHaveBeenCalled();
  expect(mockedLogger.fatal).toHaveBeenCalledWith(expect.stringContaining('Cloudflare'));
  expect(hasVerboseErrorLogs()).toBe(false);
});

test('should keep mace list generation for non-Cloudflare startFetchingReplays errors', async () => {
  const fetchReplaysCronJob = cronJobs[1];

  mockedStartFetchingReplays.mockRejectedValue(new Error('Unknown parsing failure'));

  await expect(fetchReplaysCronJob.callback()).resolves.toBeUndefined();

  expect(mockedStartFetchingReplays).toHaveBeenCalledTimes(1);
  expect(mockedGenerateMaceList).toHaveBeenCalledTimes(1);
  expect(mockedLogger.fatal).toHaveBeenCalledWith(expect.stringContaining('Trace:'));
});

test('should download nameChanges.csv and reset names cache before parsing replays', async () => {
  const parseReplaysCronJob = cronJobs[2];
  const csvContent = 'old,new,date,status\noldName,newName,11.02.2026 20:10,Принято';

  mockedRequest.mockResolvedValue({
    text: jest.fn().mockResolvedValue(csvContent),
  } as never);

  await expect(parseReplaysCronJob.callback()).resolves.toBeUndefined();

  expect(parseReplaysCronJob.expression).toBe('15 */1 * * *');
  expect(mockedRequest).toHaveBeenCalledWith(nameChangesCsvURL);
  expect(mockedFs.ensureDirSync).toHaveBeenCalledWith(expect.stringContaining('/sg_stats/config'));
  expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
    expect.stringContaining('/sg_stats/config/nameChanges.csv'),
    csvContent,
    'utf8',
  );
  expect(mockedResetNamesList).toHaveBeenCalledTimes(1);
  expect(mockedStartParsingReplays).toHaveBeenCalledTimes(1);
  expect(mockedRequest.mock.invocationCallOrder[0]).toBeLessThan(
    mockedStartParsingReplays.mock.invocationCallOrder[0],
  );
  expect(mockedResetNamesList.mock.invocationCallOrder[0]).toBeLessThan(
    mockedStartParsingReplays.mock.invocationCallOrder[0],
  );
});

test('should continue parsing when nameChanges.csv download fails', async () => {
  const parseReplaysCronJob = cronJobs[2];
  const downloadError = new Error('CSV download failed');

  mockedRequest.mockRejectedValue(downloadError);

  await expect(parseReplaysCronJob.callback()).resolves.toBeUndefined();

  expect(mockedStartParsingReplays).toHaveBeenCalledTimes(1);
  expect(mockedResetNamesList).not.toHaveBeenCalled();
  expect(mockedLogger.error).toHaveBeenCalledWith(expect.stringContaining('nameChanges.csv'));
});
