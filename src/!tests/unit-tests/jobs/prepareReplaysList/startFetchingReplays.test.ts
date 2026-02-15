import fs from 'fs-extra';
import { Response } from 'node-fetch';

import logger from '../../../../0 - utils/logger';
import { replaysListPath } from '../../../../0 - utils/paths';
import request, { CloudflareBanError } from '../../../../0 - utils/request';
import startFetchingReplays from '../../../../jobs/prepareReplaysList';
import { excludeReplaysPath, includeReplaysPath } from '../../../../jobs/prepareReplaysList/consts';
import fetchReplayPage from '../../../../jobs/prepareReplaysList/utils/fetchReplayPage';
import fetchReplaysPage from '../../../../jobs/prepareReplaysList/utils/fetchReplaysPage';

jest.mock('fs-extra', () => ({
  accessSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));
jest.mock('../../../../0 - utils/generateBasicFolders', () => jest.fn());
jest.mock('../../../../0 - utils/request', () => {
  const actual = jest.requireActual('../../../../0 - utils/request');

  return {
    __esModule: true,
    ...actual,
    default: jest.fn(),
  };
});
jest.mock('../../../../jobs/prepareReplaysList/utils/fetchReplayPage', () => jest.fn());
jest.mock('../../../../jobs/prepareReplaysList/utils/fetchReplaysPage', () => jest.fn());
jest.mock('../../../../0 - utils/logger', () => ({
  __esModule: true,
  default: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
}));

const mockedFs = fs as unknown as {
  accessSync: jest.Mock;
  readFileSync: jest.Mock;
  writeFileSync: jest.Mock;
};
const mockedRequest = request as jest.MockedFunction<typeof request>;
const mockedFetchReplayPage = fetchReplayPage as jest.MockedFunction<typeof fetchReplayPage>;
const mockedFetchReplaysPage = fetchReplaysPage as jest.MockedFunction<typeof fetchReplaysPage>;
const mockedLogger = logger as unknown as {
  debug: jest.Mock;
  info: jest.Mock;
  error: jest.Mock;
};

const defaultReplaysList = {
  parsedReplays: [],
  replays: [],
  problematicReplays: [],
};

const replaysListPageHTML = `
  <table class="common-table">
    <tbody>
      <tr>
        <td><a href="/replays/1657308763">sg@test_mission</a></td>
        <td>Chernarus</td>
        <td>17</td>
      </tr>
    </tbody>
  </table>
`;

const replaysListPageWithTwoRowsHTML = `
  <table class="common-table">
    <tbody>
      <tr>
        <td><a href="/replays/1657308763">sg@test_mission</a></td>
        <td>Chernarus</td>
        <td>17</td>
      </tr>
      <tr>
        <td><a href="/replays/1657308764">sg@test_mission_2</a></td>
        <td>Chernarus</td>
        <td>17</td>
      </tr>
    </tbody>
  </table>
`;

const firstReplaysListPageWithPaginationHTML = `
  <table class="common-table">
    <tbody></tbody>
  </table>
  <div class="pagination-item"><a href="#">1</a></div>
  <div class="pagination-item"><a href="#">2</a></div>
  <div class="pagination-item"><a href="#">Next</a></div>
`;

const cloudflareBanError = (url: string): CloudflareBanError => (
  new CloudflareBanError(url, null)
);

const cloudflareBanErrorByName = (): Error => {
  const error = new Error('sg.zone request was blocked by Cloudflare');

  error.name = 'CloudflareBanError';

  return error;
};

const expectNoTraceInErrorLogs = (): void => {
  const hasVerboseLogs = mockedLogger.error.mock.calls.some(
    ([message]) => /Trace:|stack:/i.test(String(message)),
  );

  expect(hasVerboseLogs).toBe(false);
};

beforeEach(() => {
  mockedFs.accessSync.mockReset();
  mockedFs.readFileSync.mockReset();
  mockedFs.writeFileSync.mockReset();
  mockedRequest.mockReset();
  mockedFetchReplayPage.mockReset();
  mockedFetchReplaysPage.mockReset();
  mockedLogger.debug.mockReset();
  mockedLogger.info.mockReset();
  mockedLogger.error.mockReset();

  mockedFs.readFileSync.mockImplementation((filePath: string) => {
    if (filePath === replaysListPath) return JSON.stringify(defaultReplaysList);

    if (filePath === includeReplaysPath) return JSON.stringify([]);

    if (filePath === excludeReplaysPath) return JSON.stringify([]);

    throw new Error(`Unexpected file path in test: ${filePath}`);
  });
  mockedFs.accessSync.mockImplementation(() => {
    throw new Error('File does not exist');
  });
  mockedRequest.mockResolvedValue({
    text: async () => '{"ok":true}',
  } as Response);
  mockedFetchReplayPage.mockResolvedValue('<html><body data-ocap="test-file-name"></body></html>');
  mockedFetchReplaysPage.mockResolvedValue(replaysListPageHTML);
});

test('should stop startFetchingReplays job immediately when first replays page request is blocked by Cloudflare', async () => {
  mockedFetchReplaysPage.mockRejectedValue(
    cloudflareBanError('https://sg.zone/replays?p=1'),
  );

  await expect(startFetchingReplays(null)).rejects.toThrow('Cloudflare');

  expect(mockedFetchReplaysPage).toHaveBeenCalledTimes(1);
  expect(mockedFs.writeFileSync).not.toHaveBeenCalled();
  expectNoTraceInErrorLogs();
});

test('should stop startFetchingReplays job when second replays page request is blocked by Cloudflare', async () => {
  mockedFetchReplaysPage
    .mockResolvedValueOnce(firstReplaysListPageWithPaginationHTML)
    .mockRejectedValueOnce(cloudflareBanError('https://sg.zone/replays?p=2'));

  await expect(startFetchingReplays(null)).rejects.toThrow('Cloudflare');

  expect(mockedFetchReplaysPage).toHaveBeenCalledTimes(2);
  expect(mockedFs.writeFileSync).not.toHaveBeenCalled();
  expectNoTraceInErrorLogs();
});

test('should stop startFetchingReplays job when parseReplay fails with Cloudflare ban', async () => {
  mockedFetchReplayPage.mockRejectedValue(
    cloudflareBanError('https://sg.zone/replays/1657308763'),
  );

  await expect(startFetchingReplays(null)).rejects.toThrow('Cloudflare');

  expect(mockedFetchReplaysPage).toHaveBeenCalledTimes(1);
  expect(mockedRequest).not.toHaveBeenCalled();
  expect(mockedFs.writeFileSync).not.toHaveBeenCalled();
  expectNoTraceInErrorLogs();
});

test('should stop startFetchingReplays job when saveReplayFile fails with Cloudflare ban', async () => {
  mockedRequest.mockRejectedValue(
    cloudflareBanErrorByName(),
  );

  await expect(startFetchingReplays(null)).rejects.toThrow('Cloudflare');

  expect(mockedFetchReplaysPage).toHaveBeenCalledTimes(1);
  expect(mockedFetchReplayPage).toHaveBeenCalledTimes(1);
  expect(mockedRequest).toHaveBeenCalledTimes(1);
  expect(mockedFs.writeFileSync).not.toHaveBeenCalled();
  expectNoTraceInErrorLogs();
});

test('should stop startFetchingReplays job when one replay parsing task fails with Cloudflare ban on multi-row page', async () => {
  mockedFetchReplaysPage.mockResolvedValue(replaysListPageWithTwoRowsHTML);
  mockedFetchReplayPage
    .mockRejectedValueOnce(cloudflareBanError('https://sg.zone/replays/1657308763'))
    .mockResolvedValueOnce('<html><body data-ocap="second-file-name"></body></html>');

  await expect(startFetchingReplays(null)).rejects.toThrow('Cloudflare');

  expect(mockedFetchReplaysPage).toHaveBeenCalledTimes(1);
  expect(mockedFetchReplayPage).toHaveBeenCalledTimes(2);
  expect(mockedFs.writeFileSync).not.toHaveBeenCalledWith(
    replaysListPath,
    expect.any(String),
  );
  expectNoTraceInErrorLogs();
});

test('should not stop startFetchingReplays job on non-Cloudflare parsing error', async () => {
  mockedFetchReplayPage.mockRejectedValue(new Error('Replay page fetch failed'));

  await expect(startFetchingReplays(null)).resolves.toBeUndefined();

  expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
  expect(mockedLogger.error).toHaveBeenCalledWith(expect.stringContaining('Error occurred during parsing replay info.'));
});
