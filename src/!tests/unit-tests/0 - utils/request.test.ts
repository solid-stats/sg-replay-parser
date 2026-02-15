import fetch, { Response } from 'node-fetch';

import getProxiedRequest from '../../../0 - utils/getProxiedRequest';
import logger from '../../../0 - utils/logger';
import request, {
  CloudflareBanError,
  isCloudflareBanError,
} from '../../../0 - utils/request';

jest.mock('node-fetch', () => jest.fn());
jest.mock('../../../0 - utils/getProxiedRequest', () => jest.fn());
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

const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;
const mockedGetProxiedRequest = getProxiedRequest as jest.MockedFunction<typeof getProxiedRequest>;
const mockedLogger = logger as unknown as {
  error: jest.Mock;
};
const minuteInMs = 60 * 1000;
const requestTimeoutMs = 30 * 1000;
const requestsBurstCount = 100;
let fakeNow = new Date('2026-01-01T00:00:00.000Z').getTime();

beforeEach(() => {
  jest.useFakeTimers({ doNotFake: ['performance'] });
  jest.setSystemTime(new Date(fakeNow));
  fakeNow += minuteInMs * 2;
  mockedFetch.mockReset();
  mockedGetProxiedRequest.mockReset();
  mockedGetProxiedRequest.mockResolvedValue(null);
  mockedLogger.error.mockReset();
});

afterEach(() => {
  jest.useRealTimers();
});

test(`should not limit sg.zone requests under burst of ${requestsBurstCount} requests`, async () => {
  mockedFetch.mockResolvedValue({ status: 200 } as Response);

  const pendingRequests = Array.from({ length: requestsBurstCount }, (_item, index) => (
    request(`https://sg.zone/replays?p=${index + 1}`)
  ));

  await expect(Promise.all(pendingRequests)).resolves.toHaveLength(requestsBurstCount);
  expect(mockedFetch).toHaveBeenCalledTimes(requestsBurstCount);
});

test('should treat invalid URL as non-sg.zone request', async () => {
  const defaultResponse = { status: 200 } as Response;

  mockedFetch.mockResolvedValue(defaultResponse);

  await expect(request('invalid-url')).resolves.toBe(defaultResponse);
  expect(mockedFetch).toHaveBeenCalledWith('invalid-url');
});

test('should pass timeout option to direct fetch requests', async () => {
  const defaultResponse = { status: 200 } as Response;

  mockedFetch.mockResolvedValue(defaultResponse);

  await expect(request('https://sg.zone/replays?p=timeout-check')).resolves.toBe(defaultResponse);

  expect(mockedFetch).toHaveBeenCalledWith('https://sg.zone/replays?p=timeout-check', {
    timeout: requestTimeoutMs,
  });
});

test('should skip Cloudflare body inspection for sg.zone non-html responses', async () => {
  const cloneTextMock = jest.fn(async () => '{"unexpected":"clone-read"}');
  const defaultResponse = {
    status: 200,
    headers: {
      get: (headerName: string) => (headerName === 'content-type' ? 'application/json' : null),
    },
    clone: () => ({
      text: cloneTextMock,
    }),
  } as unknown as Response;

  mockedFetch.mockResolvedValue(defaultResponse);

  await expect(request('https://sg.zone/data/test.json')).resolves.toBe(defaultResponse);
  expect(cloneTextMock).not.toHaveBeenCalled();
});

test('should return proxied response for sg.zone when proxy response is not Cloudflare ban page', async () => {
  const proxiedResponse = {
    clone: () => ({
      text: async () => '<html><body>ok</body></html>',
    }),
  } as Response;

  mockedGetProxiedRequest.mockResolvedValue(proxiedResponse);

  await expect(request('https://sg.zone/replays?p=2')).resolves.toBe(proxiedResponse);
  expect(mockedFetch).not.toHaveBeenCalled();
});

test('should stop request when Cloudflare block page is returned from sg.zone proxy response', async () => {
  const cloudflareBlockPageHTML = `
    <!DOCTYPE html>
    <html lang="en-US">
      <head><title>Attention Required! | Cloudflare</title></head>
      <body>
        <h1>Sorry, you have been blocked</h1>
        <h2><span>You are unable to access</span> sg.zone</h2>
      </body>
    </html>
  `;
  const proxiedResponse = {
    clone: () => ({
      text: async () => cloudflareBlockPageHTML,
    }),
  } as Response;

  mockedGetProxiedRequest.mockResolvedValue(proxiedResponse);

  await expect(request('https://sg.zone/replays?p=2'))
    .rejects
    .toThrow('sg.zone request was blocked by Cloudflare');

  expect(mockedFetch).not.toHaveBeenCalled();
  expect(mockedLogger.error).toHaveBeenCalledWith(expect.stringContaining('Cloudflare'));
});

test('should skip Cloudflare validation for proxied non-sg.zone response', async () => {
  const proxiedResponse = { status: 200 } as Response;

  mockedGetProxiedRequest.mockResolvedValue(proxiedResponse);

  await expect(request('https://example.com/replays?p=2')).resolves.toBe(proxiedResponse);
  expect(mockedFetch).not.toHaveBeenCalled();
});

test('should ignore Cloudflare check when response clone text throws', async () => {
  const proxiedResponse = {
    clone: () => ({
      text: async () => { throw new Error('Cannot read body'); },
    }),
  } as Response;

  mockedGetProxiedRequest.mockResolvedValue(proxiedResponse);

  await expect(request('https://sg.zone/replays?p=3')).resolves.toBe(proxiedResponse);
  expect(mockedFetch).not.toHaveBeenCalled();
});

test('should stop request when Cloudflare block page is returned from sg.zone', async () => {
  const cloudflareBlockPageHTML = `
    <!DOCTYPE html>
    <html lang="en-US">
      <head><title>Attention Required! | Cloudflare</title></head>
      <body>
        <h1>Sorry, you have been blocked</h1>
        <h2><span>You are unable to access</span> sg.zone</h2>
        <span>Cloudflare Ray ID: <strong>9cd154621dcde49e</strong></span>
      </body>
    </html>
  `;

  mockedFetch.mockResolvedValue({
    status: 403,
    clone: () => ({
      text: async () => cloudflareBlockPageHTML,
    }),
  } as Response);

  await expect(request('https://sg.zone/replays?p=1'))
    .rejects
    .toThrow('sg.zone request was blocked by Cloudflare');

  expect(mockedFetch).toHaveBeenCalledTimes(1);
  expect(mockedLogger.error).toHaveBeenCalledWith(expect.stringContaining('Cloudflare'));
  expect(mockedLogger.error).toHaveBeenCalledWith(expect.stringContaining('9cd154621dcde49e'));
});

test('should log Cloudflare error without Ray ID when block page does not contain it', async () => {
  const cloudflareBlockPageWithoutRayId = `
    <!DOCTYPE html>
    <html lang="en-US">
      <head><title>Attention Required! | Cloudflare</title></head>
      <body>
        <h1>Sorry, you have been blocked</h1>
        <h2><span>You are unable to access</span> sg.zone</h2>
      </body>
    </html>
  `;

  mockedFetch.mockResolvedValue({
    status: 403,
    clone: () => ({
      text: async () => cloudflareBlockPageWithoutRayId,
    }),
  } as Response);

  await expect(request('https://sg.zone/replays?p=4'))
    .rejects
    .toThrow('sg.zone request was blocked by Cloudflare');

  const firstLogMessage = mockedLogger.error.mock.calls[0][0] as string;

  expect(firstLogMessage).not.toContain('Cloudflare Ray ID:');
  expect(firstLogMessage).not.toMatch(/Trace:|stack:/i);
});

test('should retry fetch errors and throw after retry limit is reached', async () => {
  const fetchError = new Error('Network down');

  mockedFetch.mockRejectedValue(fetchError);

  await expect(request('https://sg.zone/replays?p=5'))
    .rejects
    .toThrow('Network down');

  expect(mockedFetch).toHaveBeenCalledTimes(4);
  expect(mockedLogger.error).toHaveBeenCalledWith(expect.stringContaining('Unknown error occurred during fetching: Network down.'));
  expect(mockedLogger.error).toHaveBeenCalledWith(expect.stringContaining('did not disappear after 3 retries'));
});

test('should not depend on Date.now for sg.zone requests when limiter is disabled', async () => {
  const dateNowSpy = jest.spyOn(Date, 'now');
  const defaultResponse = { status: 200 } as Response;

  dateNowSpy.mockImplementation(() => { throw new Error('Date.now failure'); });
  mockedFetch.mockResolvedValue(defaultResponse);

  await expect(request('https://sg.zone/replays?p=6', 0)).resolves.toBe(defaultResponse);

  dateNowSpy.mockRestore();
});

test('should recover from transient non-sg.zone fetch error and continue on retry', async () => {
  const defaultResponse = { status: 200 } as Response;

  mockedFetch
    .mockRejectedValueOnce(new Error('Temporary non-sg.zone failure'))
    .mockResolvedValueOnce(defaultResponse);

  await expect(request('https://example.com/replays?p=6')).resolves.toBe(defaultResponse);
  expect(mockedFetch).toHaveBeenCalledTimes(2);
  expect(mockedLogger.error).toHaveBeenCalledWith(expect.stringContaining('Temporary non-sg.zone failure'));
});

test('should fallback to direct fetch for non-sg.zone URL when relay supports only sg.zone', async () => {
  const defaultResponse = { status: 200 } as Response;

  mockedGetProxiedRequest.mockRejectedValue(
    new Error('Relay mode supports only https://sg.zone URLs.'),
  );
  mockedFetch.mockResolvedValue(defaultResponse);

  await expect(request('https://docs.google.com/spreadsheets/d/abc')).resolves.toBe(defaultResponse);

  expect(mockedGetProxiedRequest).toHaveBeenCalledTimes(1);
  expect(mockedFetch).toHaveBeenCalledTimes(1);
  expect(mockedLogger.error).not.toHaveBeenCalled();
});

test('should not swallow relay unsupported-url error for sg.zone requests', async () => {
  mockedGetProxiedRequest.mockRejectedValue(
    new Error('Relay mode supports only https://sg.zone URLs.'),
  );

  await expect(request('https://sg.zone/replays?p=8', 0))
    .rejects
    .toThrow('Relay mode supports only https://sg.zone URLs.');

  expect(mockedFetch).not.toHaveBeenCalled();
});

test('should not swallow unexpected relay errors for non-sg.zone requests', async () => {
  mockedGetProxiedRequest.mockRejectedValue(new Error('Relay unavailable'));

  await expect(request('https://docs.google.com/spreadsheets/d/abc'))
    .rejects
    .toThrow('Relay unavailable');

  expect(mockedFetch).not.toHaveBeenCalled();
  expect(mockedLogger.error).toHaveBeenCalledWith(expect.stringContaining('Relay unavailable'));
});

test('should detect Cloudflare ban errors by instance', () => {
  expect(isCloudflareBanError(new CloudflareBanError('https://sg.zone/replays?p=1', null))).toBe(true);
});

test('should detect Cloudflare ban errors by name', () => {
  const cloudflareErrorByName = new Error('sg.zone request was blocked by Cloudflare');

  cloudflareErrorByName.name = 'CloudflareBanError';

  expect(isCloudflareBanError(cloudflareErrorByName)).toBe(true);
});

test('should not detect null value as Cloudflare ban error', () => {
  expect(isCloudflareBanError(null)).toBe(false);
});

test('should throw timeout error when request exceeds timeout limit', async () => {
  mockedFetch.mockImplementation(() => new Promise(() => {}));
  mockedGetProxiedRequest.mockResolvedValue(null);

  const requestPromise = request('https://example.com/slow', 0);

  jest.advanceTimersByTime(requestTimeoutMs);

  await expect(requestPromise).rejects.toThrow('Timeout while fetching');
});
