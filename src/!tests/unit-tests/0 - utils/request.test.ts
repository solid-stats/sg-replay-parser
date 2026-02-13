import fetch, { Response } from 'node-fetch';

import getProxiedRequest from '../../../0 - utils/getProxiedRequest';
import logger from '../../../0 - utils/logger';
import request, {
  CloudflareBanError,
  getSgZoneRequestQueueState,
  isCloudflareBanError,
  waitForSgZoneRequestQueueToDrain,
} from '../../../0 - utils/request';

jest.mock('node-fetch', () => jest.fn());
jest.mock('../../../0 - utils/getProxiedRequest', () => jest.fn());
jest.mock('../../../0 - utils/logger', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
  },
}));

const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;
const mockedGetProxiedRequest = getProxiedRequest as jest.MockedFunction<typeof getProxiedRequest>;
const mockedLogger = logger as unknown as {
  error: jest.Mock;
};
const minuteInMs = 60 * 1000;
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

test('should limit sg.zone requests to 10 per minute', async () => {
  mockedFetch.mockResolvedValue({ status: 200 } as Response);

  const pendingRequests = Array.from({ length: 11 }, (_item, index) => (
    request(`https://sg.zone/replays?p=${index + 1}`)
  ));
  const firstTenRequests = pendingRequests.slice(0, 10);
  const eleventhRequest = pendingRequests[10];
  let isEleventhRequestResolved = false;

  eleventhRequest.then(() => {
    isEleventhRequestResolved = true;
  });

  await expect(Promise.all(firstTenRequests)).resolves.toHaveLength(10);
  expect(mockedFetch).toHaveBeenCalledTimes(10);
  expect(isEleventhRequestResolved).toBe(false);

  jest.advanceTimersByTime(59_999);
  await Promise.resolve();

  expect(mockedFetch).toHaveBeenCalledTimes(10);
  expect(isEleventhRequestResolved).toBe(false);

  jest.advanceTimersByTime(1);
  await expect(eleventhRequest).resolves.toEqual({ status: 200 });
  expect(mockedFetch).toHaveBeenCalledTimes(11);
});

test('should wait until sg.zone request queue is drained', async () => {
  jest.useRealTimers();
  mockedFetch.mockResolvedValue({ status: 200 } as Response);
  const pendingRequest = request('https://sg.zone/replays?p=1');

  const waitForDrainPromise = waitForSgZoneRequestQueueToDrain();
  let isQueueDrained = false;

  waitForDrainPromise.then(() => {
    isQueueDrained = true;
  });

  await Promise.resolve();
  await Promise.resolve();

  expect(isQueueDrained).toBe(false);

  await expect(pendingRequest).resolves.toEqual({ status: 200 });
  await expect(waitForDrainPromise).resolves.toBeUndefined();
});

test('should expose sg.zone queue state for diagnostics', () => {
  const queueState = getSgZoneRequestQueueState();

  expect(queueState.pending).toBeGreaterThanOrEqual(0);
  expect(queueState.active).toBeGreaterThanOrEqual(0);
  expect(queueState.total).toBe(queueState.pending + queueState.active);
});

test('should treat invalid URL as non-sg.zone request', async () => {
  const defaultResponse = { status: 200 } as Response;

  mockedFetch.mockResolvedValue(defaultResponse);

  await expect(request('invalid-url')).resolves.toBe(defaultResponse);
  expect(mockedFetch).toHaveBeenCalledWith('invalid-url');
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

test('should handle sg.zone slot reservation rejection and throw when no retries left', async () => {
  const dateNowSpy = jest.spyOn(Date, 'now');

  dateNowSpy.mockImplementation(() => { throw new Error('Date.now failure'); });

  await expect(request('https://sg.zone/replays?p=6', 0))
    .rejects
    .toThrow('Date.now failure');

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
