import { snakeCase } from 'lodash';

import logger from '../../shared/utils/logger';
import { getDbClient } from '../../db/client';
import { GameType, ReplayStatus } from '../../generated/prisma/enums';
import type { ReplayLink } from './types';

/**
 * Configuration for replays that should be included even without standard prefix
 */
export interface IncludeReplayConfig {
  name: string;
  gameType: GameType;
}

/**
 * Determine game type from mission name prefix
 * @param missionName - e.g., 'sg@222_mission', 'mace@10_mission', 'sm@123_mission'
 * @returns GameType enum value or null if invalid prefix
 */
export const parseGameType = (missionName: string): GameType | null => {
  const prefixMatch = missionName.match(/^(sg|mace|sm)@/i);

  if (!prefixMatch) return null;

  const prefix = prefixMatch[1].toLowerCase();

  switch (prefix) {
    case 'sg':
      return GameType.SG;
    case 'mace':
      return GameType.MACE;
    case 'sm':
      return GameType.SM;
    default:
      return null;
  }
};

/**
 * Check if a mission name should be included based on include config
 * This handles non-standard mission names that should still be tracked
 *
 * @param missionName - The raw mission name from the listing
 * @param includeConfig - Array of mission name patterns to include
 * @returns Normalized mission name or null if should be excluded
 */
export const getNormalizedMissionName = (
  missionName: string,
  includeConfig: IncludeReplayConfig[] = [],
): { missionName: string; gameType: GameType } | null => {
  const gameTypeSplitSymbol = '@';

  // Standard mission name with prefix (e.g., 'sg@222_mission')
  if (missionName.includes(gameTypeSplitSymbol)) {
    // Exclude SGS (internal test) missions
    if (missionName.toLowerCase().startsWith('sgs')) {
      return null;
    }

    const gameType = parseGameType(missionName);

    if (!gameType) return null;

    return { missionName, gameType };
  }

  // Check if this mission should be included via config
  const configMatch = includeConfig.find(
    ({ name }) => name.toLowerCase() === missionName.toLowerCase(),
  );

  if (configMatch) {
    // Normalize the mission name
    const normalizedName = [
      configMatch.gameType.toLowerCase(),
      snakeCase(missionName),
    ].join(gameTypeSplitSymbol);

    return { missionName: normalizedName, gameType: configMatch.gameType };
  }

  return null;
};

/**
 * Result of saving a replay
 */
export interface SaveReplayResult {
  success: boolean;
  replayId?: string;
  error?: string;
  alreadyExists?: boolean;
}

/**
 * Save a single new replay to the database
 *
 * @param replayLink - The replay link data from discovery
 * @param includeConfig - Optional config for non-standard missions
 * @returns SaveReplayResult with success status and replay ID
 */
export const saveNewReplay = async (
  replayLink: ReplayLink,
  includeConfig: IncludeReplayConfig[] = [],
): Promise<SaveReplayResult> => {
  const db = getDbClient();

  try {
    // Check if replay already exists
    const existing = await db.replay.findFirst({
      where: {
        replayLink: replayLink.url,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      return {
        success: true,
        replayId: existing.id,
        alreadyExists: true,
      };
    }

    // Parse and validate mission name
    const parsed = getNormalizedMissionName(
      replayLink.title || '',
      includeConfig,
    );

    if (!parsed) {
      return {
        success: false,
        error: `Invalid mission name: ${replayLink.title}`,
      };
    }

    // Create replay record
    const replay = await db.replay.create({
      data: {
        replayLink: replayLink.url,
        missionName: parsed.missionName,
        gameType: parsed.gameType,
        date: replayLink.date || new Date(),
        filename: replayLink.replayId, // Use replayId as placeholder, will be updated when downloaded
        status: ReplayStatus.DISCOVERED,
      },
      select: {
        id: true,
      },
    });

    logger.info(`Saved new replay: ${parsed.missionName} (${replayLink.replayId})`);

    return {
      success: true,
      replayId: replay.id,
    };
  } catch (error) {
    const err = error as Error;

    logger.error(`Failed to save replay ${replayLink.url}: ${err.message}`);

    return {
      success: false,
      error: err.message,
    };
  }
};

/**
 * Result of batch save operation
 */
export interface BatchSaveResult {
  saved: number;
  skipped: number;
  failed: number;
  errors: string[];
}

/**
 * Save multiple replays to the database
 *
 * @param replayLinks - Array of replay links to save
 * @param includeConfig - Optional config for non-standard missions
 * @returns BatchSaveResult with counts and errors
 */
export const saveNewReplays = async (
  replayLinks: ReplayLink[],
  includeConfig: IncludeReplayConfig[] = [],
): Promise<BatchSaveResult> => {
  const result: BatchSaveResult = {
    saved: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  for (const link of replayLinks) {
    // eslint-disable-next-line no-await-in-loop
    const saveResult = await saveNewReplay(link, includeConfig);

    if (saveResult.success) {
      if (saveResult.alreadyExists) {
        result.skipped += 1;
      } else {
        result.saved += 1;
      }
    } else {
      result.failed += 1;

      if (saveResult.error) {
        result.errors.push(saveResult.error);
      }
    }
  }

  logger.info(
    `Batch save complete: ${result.saved} saved, ${result.skipped} skipped, ${result.failed} failed`,
  );

  return result;
};
