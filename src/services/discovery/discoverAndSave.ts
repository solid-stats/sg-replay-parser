import logger from '../../shared/utils/logger';
import { discoverNewReplayLinks } from './discoverNewReplays';
import { saveNewReplays, type BatchSaveResult, type IncludeReplayConfig } from './saveNewReplay';
import type { DiscoverOptions } from './types';

/**
 * Options for the discover and save operation
 */
export interface DiscoverAndSaveOptions extends DiscoverOptions {
  /** Config for non-standard mission names to include */
  includeConfig?: IncludeReplayConfig[];
}

/**
 * Result of the discover and save operation
 */
export interface DiscoverAndSaveResult {
  /** Number of new replays discovered */
  discovered: number;
  /** Results from the save operation */
  saveResult: BatchSaveResult;
}

/**
 * Discover new replays from sg.zone and save them to the database
 *
 * This is the main entry point for the discovery job. It:
 * 1. Fetches replay listings from sg.zone
 * 2. Filters to only new replays not already in the database
 * 3. Validates and saves each replay to the database
 *
 * @param options - Configuration options
 * @returns Results of the operation
 */
export const discoverAndSaveReplays = async (
  options: DiscoverAndSaveOptions = {},
): Promise<DiscoverAndSaveResult> => {
  const { includeConfig, ...discoverOptions } = options;

  logger.info('Starting discovery and save process...');

  // Step 1: Discover new replays
  const newReplayLinks = await discoverNewReplayLinks(discoverOptions);

  if (newReplayLinks.length === 0) {
    logger.info('No new replays found');

    return {
      discovered: 0,
      saveResult: {
        saved: 0,
        skipped: 0,
        failed: 0,
        errors: [],
      },
    };
  }

  logger.info(`Discovered ${newReplayLinks.length} new replays`);

  // Step 2: Save to database
  const saveResult = await saveNewReplays(newReplayLinks, includeConfig);

  logger.info(
    `Discovery complete: ${newReplayLinks.length} discovered, `
    + `${saveResult.saved} saved, ${saveResult.skipped} skipped, ${saveResult.failed} failed`,
  );

  return {
    discovered: newReplayLinks.length,
    saveResult,
  };
};

/**
 * Quick discovery job - only checks the first page
 * Used for frequent polling (e.g., every 30 seconds)
 *
 * @param includeConfig - Optional config for non-standard missions
 * @returns Results of the operation
 */
export const quickDiscovery = async (
  includeConfig?: IncludeReplayConfig[],
): Promise<DiscoverAndSaveResult> => discoverAndSaveReplays({
  maxPages: 1,
  stopAfterKnownCount: 3,
  includeConfig,
});

/**
 * Full discovery job - checks all pages
 * Used for less frequent scans (e.g., every 10 minutes)
 *
 * @param includeConfig - Optional config for non-standard missions
 * @returns Results of the operation
 */
export const fullDiscovery = async (
  includeConfig?: IncludeReplayConfig[],
): Promise<DiscoverAndSaveResult> => discoverAndSaveReplays({
  maxPages: 100, // Effectively unlimited
  stopAfterKnownCount: 30,
  includeConfig,
});
