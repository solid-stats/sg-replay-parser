import fetch, { Response } from 'node-fetch';

import getProxiedRequest from './getProxiedRequest';
import logger from './logger';

const defaultRetryCount = 3;
const requestTimeoutMs = 30 * 1000;
const sgZoneHost = 'sg.zone';
const relayUnsupportedUrlErrorMessage = `Relay mode supports only https://${sgZoneHost} URLs.`;
const timeoutErrorName = 'RequestTimeoutError';

class CloudflareBanError extends Error {
  constructor(url: string, rayId: string | null) {
    const rayIdPart = rayId ? ` Cloudflare Ray ID: ${rayId}.` : '';

    super(`sg.zone request was blocked by Cloudflare while requesting ${url}.${rayIdPart}`);
    this.name = 'CloudflareBanError';
  }
}

const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string,
): Promise<T> => (
  // We keep a manual timeout wrapper globally because:
  // 1) It also protects non-fetch async paths (e.g. getProxiedRequest),
  // 2) It gives one consistent timeout error shape/name across all request flows.
  new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      const timeoutError = new Error(timeoutMessage);

      timeoutError.name = timeoutErrorName;
      reject(timeoutError);
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  })
);

const isCloudflareBanError = (err: unknown): boolean => {
  if (err instanceof CloudflareBanError) return true;

  if (typeof err !== 'object' || err === null) return false;

  return (err as { name?: unknown }).name === 'CloudflareBanError';
};

const isSgZoneRequest = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);

    return parsedUrl.protocol === 'https:' && parsedUrl.hostname === sgZoneHost;
  } catch (err) {
    return false;
  }
};

const isRelayUnsupportedUrlError = (error: unknown): boolean => (
  error instanceof Error && error.message === relayUnsupportedUrlErrorMessage
);

const getCloudflareRayId = (html: string): string | null => (
  html.match(/Cloudflare Ray ID:\s*<strong[^>]*>([^<]+)<\/strong>/i)?.[1] ?? null
);

const isCloudflareBanPage = (html: string): boolean => (
  html.includes('<title>Attention Required! | Cloudflare</title>')
  && html.includes('Sorry, you have been blocked')
  && html.includes('You are unable to access')
  && html.includes(sgZoneHost)
);

const throwIfCloudflareBanPage = async (
  url: string,
  response: Response,
): Promise<void> => {
  if (typeof response.clone !== 'function') return;

  const responseContentType = response.headers?.get('content-type') || '';

  if (responseContentType && !responseContentType.toLowerCase().includes('text/html')) return;

  let pageHTML = '';

  try {
    pageHTML = await response.clone().text();
  } catch {
    return;
  }

  if (!isCloudflareBanPage(pageHTML)) return;

  throw new CloudflareBanError(url, getCloudflareRayId(pageHTML));
};

const request = async (
  url: string,
  retryCount: number = defaultRetryCount,
): Promise<Response | null> => {
  const isSgZoneUrl = isSgZoneRequest(url);

  try {
    let proxiedResponse: Response | null = null;

    try {
      proxiedResponse = await withTimeout(
        getProxiedRequest(url),
        requestTimeoutMs,
        `Timeout while fetching proxied request for ${url}`,
      );
    } catch (err) {
      if (!(isRelayUnsupportedUrlError(err) && !isSgZoneUrl)) throw err;
    }

    if (proxiedResponse) {
      if (isSgZoneUrl) await throwIfCloudflareBanPage(url, proxiedResponse);

      return proxiedResponse;
    }

    const fetchPromise = isSgZoneUrl
      // node-fetch timeout is still kept as a transport-level guard.
      ? fetch(url, { timeout: requestTimeoutMs })
      : fetch(url);
    const resp = await withTimeout(
      fetchPromise,
      requestTimeoutMs,
      `Timeout while fetching ${url}`,
    );

    if (isSgZoneUrl) await throwIfCloudflareBanPage(url, resp);

    return resp;
  } catch (err) {
    if (err instanceof CloudflareBanError) {
      logger.error(err.message);

      throw err;
    }

    if (retryCount === defaultRetryCount) { logger.error(`Unknown error occurred during fetching: ${err.message}.`); }

    if (retryCount === 0) {
      logger.error(`The fetching error did not disappear after ${defaultRetryCount} retries. Trace: ${err.stack}`);

      throw err;
    }

    return await request(url, retryCount - 1);
  }
};

export {
  CloudflareBanError,
  isCloudflareBanError,
};

export default request;
