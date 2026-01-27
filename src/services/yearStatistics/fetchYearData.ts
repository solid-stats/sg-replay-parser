/**
 * Fetch year data from database
 * Provides data for year statistics nominations
 */

import { getDbClient } from '../../db/client';
import calculateScore from '../../shared/utils/calculateScore';

import type { YearReplay, PlayerYearStats } from './types';

/**
 * Fetch all parsed replays for a specific year
 */
export const fetchYearReplays = async (year: number): Promise<YearReplay[]> => {
  const db = getDbClient();

  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

  const replays = await db.replay.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: 'PARSED',
    },
    include: {
      playerResults: {
        include: {
          player: {
            include: {
              names: {
                where: {
                  OR: [
                    {
                      AND: [
                        { validFrom: { lte: endDate } },
                        { validTo: { gte: startDate } },
                      ],
                    },
                    {
                      AND: [
                        { validFrom: { lte: endDate } },
                        { validTo: null },
                      ],
                    },
                  ],
                },
                orderBy: {
                  validFrom: 'desc',
                },
                take: 1,
              },
            },
          },
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  return replays.map((replay) => ({
    id: replay.id,
    replayId: replay.filename,
    date: replay.date,
    missionName: replay.missionName,
    worldName: '', // TODO: extract from mission name or events
    filePath: null, // Files are stored in raw_replays by filename
    playerResults: replay.playerResults.map((pr) => ({
      playerId: pr.playerId,
      playerName: pr.player?.names?.[0]?.name ?? pr.entityName,
      kills: pr.kills,
      deaths: pr.deaths,
      teamkills: pr.teamkills,
      deathsByTeamkills: pr.deathsByTeamkills,
    })),
  }));
};

/**
 * Aggregate player statistics from replays
 */
export const aggregatePlayerStats = (
  replays: YearReplay[],
): Map<string, PlayerYearStats> => {
  const statsMap = new Map<string, PlayerYearStats>();

  for (const replay of replays) {
    for (const pr of replay.playerResults) {
      const existing = statsMap.get(pr.playerId);

      if (existing) {
        existing.totalKills += pr.kills;
        existing.totalDeaths += pr.deaths;
        existing.totalGames += 1;
        existing.teamkills += pr.teamkills;
        existing.deathsByTeamkills += pr.deathsByTeamkills;
        existing.score = calculateScore(
          existing.totalGames,
          existing.totalKills,
          existing.teamkills,
          { total: existing.totalDeaths, byTeamkills: existing.deathsByTeamkills },
        );
      } else {
        statsMap.set(pr.playerId, {
          playerId: pr.playerId,
          playerName: pr.playerName,
          totalKills: pr.kills,
          totalDeaths: pr.deaths,
          totalGames: 1,
          teamkills: pr.teamkills,
          deathsByTeamkills: pr.deathsByTeamkills,
          score: calculateScore(
            1,
            pr.kills,
            pr.teamkills,
            { total: pr.deaths, byTeamkills: pr.deathsByTeamkills },
          ),
        });
      }
    }
  }

  return statsMap;
};

/**
 * Create YearContext for nominations
 */
export const createYearContext = async (year: number) => {
  const replays = await fetchYearReplays(year);
  const playerStats = aggregatePlayerStats(replays);

  return {
    year,
    replays,
    playerStats,
  };
};
