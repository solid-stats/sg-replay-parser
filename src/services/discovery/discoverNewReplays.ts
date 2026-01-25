import { getDbClient } from '../../db/client';
import logger from '../../0 - utils/logger';
import { fetchReplaysPage } from './fetchReplays';
import type { DiscoverOptions, ReplayLink } from './types';

const DEFAULT_MAX_PAGES = 10;
const DEFAULT_STOP_AFTER_KNOWN_COUNT = 5;

/**
 * Get set of known replay IDs from database
 * Only includes replays that are not in DISCOVERED status (have been processed)
 * @returns Set of known replay IDs (the URL-based IDs, not UUIDs)
 */
export const getKnownReplayIds = async (): Promise<Set<string>> => {
  const db = getDbClient();

  const replays = await db.replay.findMany({
    select: {
      replayLink: true,
    },
  });

  // Extract replay IDs from replayLinks (format: '/replays/1657308763')
  const ids = new Set<string>();
  replays.forEach((replay) => {
    const match = replay.replayLink.match(/\/replays\/(\d+)/);
    if (match) {
      ids.add(match[1]);
    }
  });

  return ids;
};

/**
 * Filter replays to only include new ones not in the known set
 * @param replays - Array of replay links to filter
 * @param knownIds - Set of known replay IDs
 * @returns Array of new replay links
 */
export const filterNewReplays = (
  replays: ReplayLink[],
  knownIds: Set<string>,
): ReplayLink[] => replays.filter((replay) => !knownIds.has(replay.replayId));

/**
 * Discover new replays from sg.zone that are not in the database
 * Stops early when finding consecutive known replays (optimization)
 *
 * @param options - Optional configuration
 * @returns Promise with array of new replay IDs
 */
export const discoverNewReplays = async (
  options: DiscoverOptions = {},
): Promise<string[]> => {
  const {
    maxPages = DEFAULT_MAX_PAGES,
    stopAfterKnownCount = DEFAULT_STOP_AFTER_KNOWN_COUNT,
  } = options;

  logger.info('Starting replay discovery...');

  // Get known replay IDs from database
  const knownIds = await getKnownReplayIds();
  logger.info(`Found ${knownIds.size} known replays in database`);

  const newReplayIds: string[] = [];
  let consecutiveKnownCount = 0;

  // Fetch first page to get total pages
  const firstPageResult = await fetchReplaysPage(1);
  const totalPages = Math.min(firstPageResult.totalPages, maxPages);

  logger.info(`Fetching up to ${totalPages} pages...`);

  // Process first page
  for (const replay of firstPageResult.replays) {
    if (knownIds.has(replay.replayId)) {
      consecutiveKnownCount += 1;
      if (consecutiveKnownCount >= stopAfterKnownCount) {
        logger.info(`Found ${stopAfterKnownCount} consecutive known replays, stopping discovery`);
        return newReplayIds;
      }
    } else {
      consecutiveKnownCount = 0;
      newReplayIds.push(replay.replayId);
    }
  }

  // Fetch remaining pages
  for (let page = 2; page <= totalPages; page += 1) {
    // eslint-disable-next-line no-await-in-loop
    const pageResult = await fetchReplaysPage(page);

    for (const replay of pageResult.replays) {
      if (knownIds.has(replay.replayId)) {
        consecutiveKnownCount += 1;
        if (consecutiveKnownCount >= stopAfterKnownCount) {
          logger.info(`Found ${stopAfterKnownCount} consecutive known replays on page ${page}, stopping discovery`);
          return newReplayIds;
        }
      } else {
        consecutiveKnownCount = 0;
        newReplayIds.push(replay.replayId);
      }
    }
  }

  logger.info(`Discovery complete. Found ${newReplayIds.length} new replays`);
  return newReplayIds;
};

/**
 * Discover new replays and return full ReplayLink objects
 * @param options - Optional configuration
 * @returns Promise with array of new ReplayLink objects
 */
export const discoverNewReplayLinks = async (
  options: DiscoverOptions = {},
): Promise<ReplayLink[]> => {
  const {
    maxPages = DEFAULT_MAX_PAGES,
    stopAfterKnownCount = DEFAULT_STOP_AFTER_KNOWN_COUNT,
  } = options;

  logger.info('Starting replay discovery (full links)...');

  const knownIds = await getKnownReplayIds();
  logger.info(`Found ${knownIds.size} known replays in database`);

  const newReplays: ReplayLink[] = [];
  let consecutiveKnownCount = 0;

  const firstPageResult = await fetchReplaysPage(1);
  const totalPages = Math.min(firstPageResult.totalPages, maxPages);

  logger.info(`Fetching up to ${totalPages} pages...`);

  for (const replay of firstPageResult.replays) {
    if (knownIds.has(replay.replayId)) {
      consecutiveKnownCount += 1;
      if (consecutiveKnownCount >= stopAfterKnownCount) {
        logger.info(`Found ${stopAfterKnownCount} consecutive known replays, stopping discovery`);
        return newReplays;
      }
    } else {
      consecutiveKnownCount = 0;
      newReplays.push(replay);
    }
  }

  for (let page = 2; page <= totalPages; page += 1) {
    // eslint-disable-next-line no-await-in-loop
    const pageResult = await fetchReplaysPage(page);

    for (const replay of pageResult.replays) {
      if (knownIds.has(replay.replayId)) {
        consecutiveKnownCount += 1;
        if (consecutiveKnownCount >= stopAfterKnownCount) {
          logger.info(`Found ${stopAfterKnownCount} consecutive known replays on page ${page}, stopping discovery`);
          return newReplays;
        }
      } else {
        consecutiveKnownCount = 0;
        newReplays.push(replay);
      }
    }
  }

  logger.info(`Discovery complete. Found ${newReplays.length} new replays`);
  return newReplays;
};
