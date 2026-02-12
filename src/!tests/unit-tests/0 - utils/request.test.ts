import fetch from 'node-fetch';

import getProxiedRequest from '../../../0 - utils/getProxiedRequest';
import request, {
  getSgZoneRequestQueueState,
  waitForSgZoneRequestQueueToDrain,
} from '../../../0 - utils/request';

jest.mock('node-fetch', () => jest.fn());
jest.mock('../../../0 - utils/getProxiedRequest', () => jest.fn());

const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;
const mockedGetProxiedRequest = getProxiedRequest as jest.MockedFunction<typeof getProxiedRequest>;
const minuteInMs = 60 * 1000;
let fakeNow = new Date('2026-01-01T00:00:00.000Z').getTime();

beforeEach(() => {
  jest.useFakeTimers({ doNotFake: ['performance'] });
  jest.setSystemTime(new Date(fakeNow));
  fakeNow += minuteInMs * 2;
  mockedFetch.mockReset();
  mockedGetProxiedRequest.mockReset();
  mockedGetProxiedRequest.mockResolvedValue(null);
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
