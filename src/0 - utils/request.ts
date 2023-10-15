import fetch from 'node-fetch';

import logger from './logger';

const defaultRetryCount = 3;

const request = async (
  url: string,
  options?: RequestInit,
  retryCount: number = defaultRetryCount,
  initialRetryCount?: number,
): Promise<Response | null> => {
  try {
    const resp = await fetch(url, options);

    return resp;
  } catch (err) {
    if (retryCount === defaultRetryCount) { logger.error(`Unknown error occurred during fetching: ${err.message}.`); }

    if (retryCount === 0) {
      logger.error(`The fetching error did not disappear after ${initialRetryCount} retries. Trace: ${err.stack}`);

      throw err;
    }

    return await request(url, options, retryCount - 1, initialRetryCount ?? retryCount);
  }
};

export default request;
