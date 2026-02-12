import fetch, { Response } from 'node-fetch';

import getProxiedRequest from './getProxiedRequest';
import logger from './logger';

const defaultRetryCount = 3;
const requestsPerMinuteLimit = 10;
const minuteInMs = 60 * 1000;
const sgZoneHost = 'sg.zone';
const requestTimestamps: number[] = [];
let slotReservationQueue: Promise<void> = Promise.resolve();
let pendingSgZoneRequests = 0;
let activeSgZoneRequests = 0;

const getSgZoneRequestQueueState = () => ({
  pending: pendingSgZoneRequests,
  active: activeSgZoneRequests,
  total: pendingSgZoneRequests + activeSgZoneRequests,
});

const sleep = async (ms: number): Promise<void> => (
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  })
);

const isSgZoneRequest = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);

    return parsedUrl.protocol === 'https:' && parsedUrl.hostname === sgZoneHost;
  } catch (err) {
    return false;
  }
};

const clearExpiredTimestamps = (now: number): void => {
  while (
    requestTimestamps.length > 0
    && (now - requestTimestamps[0]) >= minuteInMs
  ) {
    requestTimestamps.shift();
  }
};

const waitForSgZoneRequestSlot = async (): Promise<void> => {
  const now = Date.now();

  clearExpiredTimestamps(now);

  if (requestTimestamps.length < requestsPerMinuteLimit) {
    requestTimestamps.push(now);

    return;
  }

  const oldestRequestTimestamp = requestTimestamps[0];
  const waitTime = minuteInMs - (now - oldestRequestTimestamp);

  await sleep(waitTime);

  await waitForSgZoneRequestSlot();
};

const reserveSgZoneRequestSlot = async (): Promise<void> => {
  const slotReservation = slotReservationQueue.then(waitForSgZoneRequestSlot);

  slotReservationQueue = slotReservation.catch(() => undefined);

  await slotReservation;
};

const waitForSgZoneRequestQueueToDrain = async (): Promise<void> => {
  if (getSgZoneRequestQueueState().total === 0) return;

  await sleep(20);

  await waitForSgZoneRequestQueueToDrain();
};

const request = async (
  url: string,
  retryCount: number = defaultRetryCount,
): Promise<Response | null> => {
  const isSgZoneUrl = isSgZoneRequest(url);
  let isSgZoneRequestActive = false;

  try {
    if (isSgZoneUrl) {
      pendingSgZoneRequests += 1;

      try {
        await reserveSgZoneRequestSlot();
      } finally {
        pendingSgZoneRequests -= 1;
      }

      activeSgZoneRequests += 1;
      isSgZoneRequestActive = true;
    }

    const proxiedResponse = await getProxiedRequest(url);

    if (proxiedResponse) return proxiedResponse;

    const resp = await fetch(url);

    return resp;
  } catch (err) {
    if (retryCount === defaultRetryCount) { logger.error(`Unknown error occurred during fetching: ${err.message}.`); }

    if (retryCount === 0) {
      logger.error(`The fetching error did not disappear after ${defaultRetryCount} retries. Trace: ${err.stack}`);

      throw err;
    }

    if (isSgZoneRequestActive) {
      activeSgZoneRequests -= 1;
      isSgZoneRequestActive = false;
    }

    return await request(url, retryCount - 1);
  } finally {
    if (isSgZoneRequestActive) {
      activeSgZoneRequests -= 1;
    }
  }
};

export { getSgZoneRequestQueueState, waitForSgZoneRequestQueueToDrain };

export default request;
