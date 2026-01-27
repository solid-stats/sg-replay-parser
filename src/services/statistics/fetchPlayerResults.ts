/**
 * Fetch player replay results from database for statistics calculation
 */

import { GameType } from '../../generated/prisma/enums';
import { getDbClient } from '../../db';
import type { PlayerResultFromDB } from './types';

export type FetchResultsOptions = {
  gameType: GameType;
  playerId?: string;
  fromDate?: Date;
  toDate?: Date;
};

/**
 * Fetches all player replay results for a specific game type
 * Includes replay data needed for aggregation
 */
export const fetchPlayerResults = async (
  options: FetchResultsOptions,
): Promise<PlayerResultFromDB[]> => {
  const db = getDbClient();

  // Build base where clause
  const baseReplayWhere: Record<string, unknown> = {
    gameType: options.gameType,
    status: 'PARSED',
  };

  // Add date filters if provided
  if (options.fromDate || options.toDate) {
    baseReplayWhere.date = {
      ...(options.fromDate && { gte: options.fromDate }),
      ...(options.toDate && { lte: options.toDate }),
    };
  }

  const where: Record<string, unknown> = {
    replay: baseReplayWhere,
  };

  if (options.playerId) {
    where.playerId = options.playerId;
  }

  const results = await db.playerReplayResult.findMany({
    where,
    include: {
      replay: {
        select: {
          date: true,
          gameType: true,
          missionName: true,
        },
      },
    },
    orderBy: {
      replay: {
        date: 'asc',
      },
    },
  });

  return results;
};

/**
 * Fetches results for multiple players
 */
export const fetchAllPlayersResults = async (
  gameType: GameType,
): Promise<Map<string, PlayerResultFromDB[]>> => {
  const results = await fetchPlayerResults({ gameType });

  const byPlayer = new Map<string, PlayerResultFromDB[]>();

  for (const result of results) {
    const existing = byPlayer.get(result.playerId) || [];
    existing.push(result);
    byPlayer.set(result.playerId, existing);
  }

  return byPlayer;
};

/**
 * Get unique player IDs that have results
 */
export const getPlayersWithResults = async (
  gameType: GameType,
): Promise<string[]> => {
  const db = getDbClient();

  const players = await db.playerReplayResult.findMany({
    where: {
      replay: {
        gameType,
        status: 'PARSED',
      },
    },
    select: {
      playerId: true,
    },
    distinct: ['playerId'],
  });

  return players.map((p) => p.playerId);
};
