/* eslint-disable no-console */
import fetch from 'node-fetch';

const request = async (
  url: string,
  options?: RequestInit,
  retryCount: number = 3,
): Promise<Response | null> => {
  try {
    const resp = await fetch(url, options);

    return resp;
  } catch (err) {
    console.log('');

    if (retryCount === 3) { console.error(`error occured: ${err.message}`); }

    console.log(`retrying ${url}, retries left: ${retryCount}`);

    if (retryCount === 0) throw err;

    return await request(url, options, retryCount - 1);
  }
};

export default request;
