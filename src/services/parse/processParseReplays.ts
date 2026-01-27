import logger from '../../shared/utils/logger';
import { prepareNamesList } from '../../shared/utils/namesHelper/prepareNamesList';
import { getDbClient } from '../../db/client';
import { ReplayStatus, GameType } from '../../generated/prisma/enums';
import { parseReplayData } from './parseReplayData';
import { saveParsedReplay, clearPlayerResults } from './saveParsedReplay';

// Initialize names list for player ID resolution
let namesListInitialized = false;

const ensureNamesListInitialized = () => {
  if (!namesListInitialized) {
    prepareNamesList();
    namesListInitialized = true;
  }
};

export type ParseResult = {
  replayId: string;
  filename: string;
  success: boolean;
  playerCount: number;
  error?: string;
};

export type BatchParseResult = {
  total: number;
  successful: number;
  failed: number;
  results: ParseResult[];
};

/**
 * Parses a single downloaded replay and saves results to database
 */
export const parseReplay = async (
  replayId: string,
  filename: string,
  date: Date,
): Promise<ParseResult> => {
  ensureNamesListInitialized();

  const baseResult = { replayId, filename };

  // Parse the replay file
  const parsedData = await parseReplayData(filename, date);

  if (!parsedData) {
    // Mark as ERROR in database
    const db = getDbClient();

    await db.replay.update({
      where: { id: replayId },
      data: { status: 'ERROR' },
    });

    return {
      ...baseResult,
      success: false,
      playerCount: 0,
      error: 'Failed to parse replay file',
    };
  }

  // Save parsed data to database
  const saveResult = await saveParsedReplay(replayId, parsedData, date);

  return {
    ...baseResult,
    success: saveResult.success,
    playerCount: saveResult.playerResultsCount,
    error: saveResult.error,
  };
};

/**
 * Gets all downloaded replays that need to be parsed
 */
export const getDownloadedReplays = async (
  gameType?: GameType,
  limit?: number,
): Promise<Array<{ id: string; filename: string; date: Date }>> => {
  const db = getDbClient();

  const replays = await db.replay.findMany({
    where: {
      status: ReplayStatus.DOWNLOADED,
      ...(gameType && { gameType }),
    },
    select: {
      id: true,
      filename: true,
      date: true,
    },
    orderBy: {
      date: 'asc',
    },
    ...(limit && { take: limit }),
  });

  return replays;
};

/**
 * Parses all downloaded replays in sequence
 *
 * @param gameType - Optional game type filter
 * @param limit - Optional maximum number of replays to process
 * @returns Batch parse result
 */
export const parseDownloadedReplays = async (
  gameType?: GameType,
  limit?: number,
): Promise<BatchParseResult> => {
  const replays = await getDownloadedReplays(gameType, limit);

  const results: ParseResult[] = [];
  let successful = 0;
  let failed = 0;

  for (const replay of replays) {
    const result = await parseReplay(replay.id, replay.filename, replay.date);

    results.push(result);

    if (result.success) {
      successful += 1;
      logger.info(`Parsed replay ${replay.filename} with ${result.playerCount} players`);
    } else {
      failed += 1;
      logger.error(`Failed to parse replay ${replay.filename}: ${result.error}`);
    }
  }

  return {
    total: replays.length,
    successful,
    failed,
    results,
  };
};

/**
 * Re-parses a specific replay (clears existing results first)
 */
export const reparseReplay = async (replayId: string): Promise<ParseResult> => {
  const db = getDbClient();

  const replay = await db.replay.findUnique({
    where: { id: replayId },
    select: {
      id: true,
      filename: true,
      date: true,
    },
  });

  if (!replay) {
    return {
      replayId,
      filename: '',
      success: false,
      playerCount: 0,
      error: 'Replay not found',
    };
  }

  // Clear existing results
  await clearPlayerResults(replayId);

  // Re-parse the replay
  return parseReplay(replayId, replay.filename, replay.date);
};

/**
 * Gets count of parsed replays
 */
export const getParsedCount = async (gameType?: GameType): Promise<number> => {
  const db = getDbClient();

  return db.replay.count({
    where: {
      status: ReplayStatus.PARSED,
      ...(gameType && { gameType }),
    },
  });
};

/**
 * Retries parsing for replays with ERROR status
 */
export const retryFailedParsing = async (
  limit?: number,
): Promise<BatchParseResult> => {
  const db = getDbClient();

  // First reset ERROR status back to DOWNLOADED for retrying
  const errorReplays = await db.replay.findMany({
    where: { status: ReplayStatus.ERROR },
    select: { id: true },
    ...(limit && { take: limit }),
  });

  if (errorReplays.length === 0) {
    return {
      total: 0,
      successful: 0,
      failed: 0,
      results: [],
    };
  }

  // Reset status to DOWNLOADED
  await db.replay.updateMany({
    where: {
      id: { in: errorReplays.map((r) => r.id) },
    },
    data: { status: ReplayStatus.DOWNLOADED },
  });

  // Now process them
  return parseDownloadedReplays(undefined, limit);
};
