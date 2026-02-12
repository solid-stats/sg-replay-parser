import fetch, { Response } from 'node-fetch';

import getProxiedRequest from './getProxiedRequest';
import logger from './logger';

const defaultRetryCount = 3;

const request = async (
  url: string,
  retryCount: number = defaultRetryCount,
): Promise<Response | null> => {
  try {
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

    return await request(url, retryCount - 1);
  }
};

export default request;
