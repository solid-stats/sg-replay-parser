import logger from '../../shared/utils/logger';
import { getDbClient } from '../../db/client';
import { ReplayStatus } from '../../generated/prisma/enums';
import { fetchReplayDetails } from './fetchReplayDetails';
import { saveReplayFile } from './saveReplayFile';

/**
 * Result of processing a single replay
 */
export interface ProcessReplayResult {
  replayId: string;
  replayLink: string;
  success: boolean;
  filename?: string;
  error?: string;
}

/**
 * Result of batch processing
 */
export interface BatchProcessResult {
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
}

/**
 * Process a single discovered replay:
 * 1. Fetch replay page to get filename
 * 2. Download the OCAP JSON file
 * 3. Update replay status in database
 *
 * @param replayId - Database ID of the replay
 * @param replayLink - URL to the replay page
 * @returns ProcessReplayResult
 */
export const processReplay = async (
  replayId: string,
  replayLink: string,
): Promise<ProcessReplayResult> => {
  const db = getDbClient();

  try {
    // Step 1: Fetch replay page to get filename
    const details = await fetchReplayDetails(replayLink);

    if (!details) {
      // Mark as error
      await db.replay.update({
        where: { id: replayId },
        data: { status: ReplayStatus.ERROR },
      });

      return {
        replayId,
        replayLink,
        success: false,
        error: 'Failed to fetch replay details',
      };
    }

    // Step 2: Download and save the OCAP file
    const saveResult = await saveReplayFile(details.filename);

    if (!saveResult.success) {
      // Mark as error
      await db.replay.update({
        where: { id: replayId },
        data: { status: ReplayStatus.ERROR },
      });

      return {
        replayId,
        replayLink,
        success: false,
        filename: details.filename,
        error: saveResult.error || 'Failed to save replay file',
      };
    }

    // Step 3: Update replay with filename and status
    await db.replay.update({
      where: { id: replayId },
      data: {
        filename: details.filename,
        status: ReplayStatus.DOWNLOADED,
      },
    });

    logger.info(`Successfully processed replay: ${replayLink} -> ${details.filename}`);

    return {
      replayId,
      replayLink,
      success: true,
      filename: details.filename,
    };
  } catch (error) {
    const err = error as Error;

    logger.error(`Error processing replay ${replayLink}: ${err.message}`);

    // Try to mark as error in database
    try {
      await db.replay.update({
        where: { id: replayId },
        data: { status: ReplayStatus.ERROR },
      });
    } catch {
      // Ignore error when updating status
    }

    return {
      replayId,
      replayLink,
      success: false,
      error: err.message,
    };
  }
};

/**
 * Options for processing discovered replays
 */
export interface ProcessDiscoveredOptions {
  /** Maximum number of replays to process in one batch (default: 10) */
  limit?: number;
}

/**
 * Process all discovered replays that haven't been downloaded yet
 *
 * Finds all replays with DISCOVERED status and processes them sequentially.
 *
 * @param options - Processing options
 * @returns BatchProcessResult with counts
 */
export const processDiscoveredReplays = async (
  options: ProcessDiscoveredOptions = {},
): Promise<BatchProcessResult> => {
  const { limit = 10 } = options;
  const db = getDbClient();

  // Find replays that need processing
  const replays = await db.replay.findMany({
    where: {
      status: ReplayStatus.DISCOVERED,
    },
    select: {
      id: true,
      replayLink: true,
    },
    take: limit,
    orderBy: {
      discoveredAt: 'asc', // Process oldest first
    },
  });

  if (replays.length === 0) {
    logger.info('No discovered replays to process');

    return {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
    };
  }

  logger.info(`Processing ${replays.length} discovered replays...`);

  const result: BatchProcessResult = {
    processed: 0,
    successful: 0,
    failed: 0,
    errors: [],
  };

  for (const replay of replays) {
    // eslint-disable-next-line no-await-in-loop
    const processResult = await processReplay(replay.id, replay.replayLink);

    result.processed += 1;

    if (processResult.success) {
      result.successful += 1;
    } else {
      result.failed += 1;

      if (processResult.error) {
        result.errors.push(`${replay.replayLink}: ${processResult.error}`);
      }
    }
  }

  logger.info(
    `Processing complete: ${result.successful} successful, ${result.failed} failed`,
  );

  return result;
};

/**
 * Get count of replays pending processing
 *
 * @returns Number of replays with DISCOVERED status
 */
export const getDiscoveredCount = async (): Promise<number> => {
  const db = getDbClient();

  const count = await db.replay.count({
    where: {
      status: ReplayStatus.DISCOVERED,
    },
  });

  return count;
};

/**
 * Get count of replays that have been downloaded
 *
 * @returns Number of replays with DOWNLOADED status
 */
export const getDownloadedCount = async (): Promise<number> => {
  const db = getDbClient();

  const count = await db.replay.count({
    where: {
      status: ReplayStatus.DOWNLOADED,
    },
  });

  return count;
};

/**
 * Retry processing failed replays
 *
 * Resets ERROR status back to DISCOVERED for retry.
 *
 * @returns Number of replays reset for retry
 */
export const retryFailedReplays = async (): Promise<number> => {
  const db = getDbClient();

  const result = await db.replay.updateMany({
    where: {
      status: ReplayStatus.ERROR,
    },
    data: {
      status: ReplayStatus.DISCOVERED,
    },
  });

  if (result.count > 0) {
    logger.info(`Reset ${result.count} failed replays for retry`);
  }

  return result.count;
};
