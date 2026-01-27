import { JSDOM } from 'jsdom';

import logger from '../../shared/utils/logger';
import request from '../../shared/utils/request';

const BASE_URL = 'https://sg.zone';

/** Number of retries for network failures */
const MAX_RETRIES = 3;

/** Exponential backoff base delay (ms) */
const BACKOFF_BASE_DELAY = process.env.NODE_ENV === 'test' ? 0 : 1000;

/**
 * Sleep for a specified number of milliseconds
 */
const sleep = (ms: number): Promise<void> => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

/**
 * Result of fetching replay details
 */
export interface ReplayDetails {
  /** The OCAP replay filename (without .json extension) */
  filename: string;
  /** The original replay link */
  replayLink: string;
}

/**
 * Parse HTML content to extract replay filename
 *
 * The filename can be found in two places:
 * 1. Input element with id="filename"
 * 2. Body element with data-ocap attribute
 *
 * @param html - HTML content of the replay page
 * @returns The filename or null if not found
 */
export const parseReplayFilename = (html: string): string | null => {
  const dom = new JSDOM(html);
  const { document } = dom.window;

  // Try input#filename first
  const filenameInput = document.getElementById('filename') as HTMLInputElement | null;

  if (filenameInput?.value) {
    return filenameInput.value;
  }

  // Try body data-ocap attribute
  const body = document.getElementsByTagName('body').item(0);
  const dataOcap = body?.getAttribute('data-ocap');

  if (dataOcap) {
    return dataOcap;
  }

  return null;
};

/**
 * Fetch replay details from a replay page
 *
 * @param replayLink - The replay link (e.g., '/replays/1657308763')
 * @returns ReplayDetails or null if failed
 */
export const fetchReplayDetails = async (
  replayLink: string,
): Promise<ReplayDetails | null> => {
  const url = replayLink.startsWith('http')
    ? replayLink
    : `${BASE_URL}${replayLink}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      if (attempt > 0) {
        // Exponential backoff: 1s, 2s, 4s
        const backoffDelay = BACKOFF_BASE_DELAY * (2 ** (attempt - 1));

        // eslint-disable-next-line no-await-in-loop
        await sleep(backoffDelay);
      }

      // eslint-disable-next-line no-await-in-loop
      const response = await request(url);

      if (!response) {
        throw new Error(`Failed to fetch replay page ${replayLink}: no response`);
      }

      // eslint-disable-next-line no-await-in-loop
      const html = await response.text();
      const filename = parseReplayFilename(html);

      if (!filename) {
        logger.warn(`Could not find filename in replay page: ${replayLink}`);

        return null;
      }

      return {
        filename,
        replayLink,
      };
    } catch (err) {
      lastError = err as Error;
      logger.warn(`Attempt ${attempt + 1}/${MAX_RETRIES} failed for ${replayLink}: ${lastError.message}`);
    }
  }

  logger.error(`All ${MAX_RETRIES} attempts failed for ${replayLink}`);

  return null;
};

/**
 * Fetch replay details for multiple replays
 *
 * @param replayLinks - Array of replay links
 * @returns Array of ReplayDetails (only successful ones)
 */
export const fetchMultipleReplayDetails = async (
  replayLinks: string[],
): Promise<ReplayDetails[]> => {
  const results: ReplayDetails[] = [];

  for (const link of replayLinks) {
    // eslint-disable-next-line no-await-in-loop
    const details = await fetchReplayDetails(link);

    if (details) {
      results.push(details);
    }
  }

  return results;
};
