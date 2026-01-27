import { JSDOM } from 'jsdom';

import logger from '../../shared/utils/logger';
import request from '../../shared/utils/request';
import type { FetchReplaysPageResult, ReplayLink } from './types';

const BASE_URL = 'https://sg.zone';
const REPLAYS_URL = `${BASE_URL}/replays`;

/** Delay between requests to avoid hammering the server (ms) */
const RATE_LIMIT_DELAY = process.env.NODE_ENV === 'test' ? 0 : 500;

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
 * Extract replay ID from a replay URL
 * @param url - URL like '/replays/1657308763'
 * @returns Extracted ID or null if invalid
 */
export const extractReplayId = (url: string): string | null => {
  const match = url.match(/\/replays\/(\d+)/);

  return match ? match[1] : null;
};

/**
 * Parse date from Unix timestamp in URL
 * @param replayId - The replay ID (Unix timestamp)
 * @returns Date object or undefined if invalid
 */
export const parseDateFromId = (replayId: string): Date | undefined => {
  const timestamp = parseInt(replayId, 10);

  if (Number.isNaN(timestamp)) return undefined;

  return new Date(timestamp * 1000);
};

/**
 * Parse a single table row to extract replay information
 * Table structure:
 * - td[0]: Mission name with link
 * - td[1]: Map/World name
 * - td[2]: Server number
 * - td[3]: Date (not used, we parse from ID)
 *
 * @param row - TR element from the replays table
 * @returns ReplayLink or null if row is invalid
 */
const parseTableRow = (row: Element): ReplayLink | null => {
  try {
    const cells = row.querySelectorAll('td');
    const linkElement = row.querySelector('a');

    if (!linkElement) return null;

    const href = linkElement.getAttribute('href');

    if (!href) return null;

    const replayId = extractReplayId(href);

    if (!replayId) return null;

    const title = linkElement.textContent?.trim() || undefined;
    const date = parseDateFromId(replayId);

    // Extract worldName from second cell
    const worldName = cells[1]?.textContent?.trim() || undefined;

    // Extract serverId from third cell
    const serverIdText = cells[2]?.textContent?.trim();
    const serverId = serverIdText ? parseInt(serverIdText, 10) : undefined;

    return {
      url: href,
      replayId,
      title,
      date,
      worldName,
      serverId: Number.isNaN(serverId) ? undefined : serverId,
    };
  } catch {
    return null;
  }
};

/**
 * Extract total pages from pagination
 * @param document - Parsed HTML document
 * @returns Total number of pages
 */
const extractTotalPages = (document: Document): number => {
  // Pagination structure: .pagination-item:nth-last-child(2) contains the last page number
  const lastPageItem = document.querySelector('.pagination-item:nth-last-child(2) > a');

  if (!lastPageItem?.textContent) return 1;

  const totalPages = parseInt(lastPageItem.textContent, 10);

  return Number.isNaN(totalPages) ? 1 : totalPages;
};

/**
 * Parse HTML content to extract replay links
 * @param html - HTML string to parse
 * @param pageNumber - Current page number
 * @returns FetchReplaysPageResult with replays and pagination info
 */
export const parseReplaysPage = (html: string, pageNumber: number): FetchReplaysPageResult => {
  const dom = new JSDOM(html);
  const { document } = dom.window;

  const rows = Array.from(document.querySelectorAll('.common-table > tbody > tr'));
  const replays = rows
    .map(parseTableRow)
    .filter((replay): replay is ReplayLink => replay !== null);

  const totalPages = extractTotalPages(document);

  return {
    replays,
    totalPages,
    currentPage: pageNumber,
  };
};

/**
 * Fetch and parse a single page of replays from sg.zone
 * @param pageNumber - Page number to fetch (1-based)
 * @returns Promise with array of ReplayLink objects
 * @throws Error if all retries fail
 */
export const fetchReplaysPage = async (pageNumber: number): Promise<FetchReplaysPageResult> => {
  const url = `${REPLAYS_URL}?p=${pageNumber}`;

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
        throw new Error(`Failed to fetch replays page ${pageNumber}: no response`);
      }

      // eslint-disable-next-line no-await-in-loop
      const html = await response.text();
      const result = parseReplaysPage(html, pageNumber);

      // Rate limiting - wait before returning to avoid hammering the server
      // eslint-disable-next-line no-await-in-loop
      await sleep(RATE_LIMIT_DELAY);

      return result;
    } catch (err) {
      lastError = err as Error;
      logger.warn(`Attempt ${attempt + 1}/${MAX_RETRIES} failed for page ${pageNumber}: ${lastError.message}`);
    }
  }

  logger.error(`All ${MAX_RETRIES} attempts failed for page ${pageNumber}`);
  throw lastError || new Error(`Failed to fetch page ${pageNumber}`);
};

/**
 * Fetch multiple pages of replays
 * @param startPage - First page to fetch (1-based)
 * @param endPage - Last page to fetch (inclusive)
 * @returns Promise with array of all ReplayLink objects from all pages
 */
export const fetchMultiplePages = async (
  startPage: number,
  endPage: number,
): Promise<ReplayLink[]> => {
  const allReplays: ReplayLink[] = [];

  for (let page = startPage; page <= endPage; page += 1) {
    // eslint-disable-next-line no-await-in-loop
    const result = await fetchReplaysPage(page);

    allReplays.push(...result.replays);
  }

  return allReplays;
};
