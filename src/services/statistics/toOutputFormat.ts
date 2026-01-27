/**
 * Convert aggregated stats to output format (GlobalPlayerStatistics)
 */

import { orderBy } from 'lodash';

import type { AggregatedPlayerStats } from './types';

type NamesInfo = {
  playerId: string;
  playerName: string;
  prefix: string | null;
};

/**
 * Add prefix to names in other players list
 */
const addPrefixAndUpdateName = (
  otherPlayersList: OtherPlayer[],
  namesInfo: NamesInfo[],
): OtherPlayer[] => (
  otherPlayersList.map(({ id, name, count }) => {
    const player = namesInfo.find((nameInfo) => id === nameInfo.playerId);

    const playerName = player?.playerName || name;
    const prefix = player?.prefix;

    if (prefix) return { id, name: `${prefix}${playerName}`, count };

    return { id, name: playerName, count };
  })
);

/**
 * Convert AggregatedPlayerStats to GlobalPlayerStatistics format
 */
export const toGlobalPlayerStatistics = (
  stats: AggregatedPlayerStats[],
): GlobalPlayerStatistics[] => {
  // Collect names info for updating other players
  const namesInfo: NamesInfo[] = stats.map((s) => ({
    playerId: s.playerId,
    playerName: s.name,
    prefix: s.lastSquadPrefix,
  }));

  return stats.map((s) => ({
    id: s.playerId,
    name: s.name,
    isShow: s.isShow,
    lastSquadPrefix: s.lastSquadPrefix,
    totalPlayedGames: s.totalPlayedGames,
    kills: s.kills,
    killsFromVehicle: s.killsFromVehicle,
    vehicleKills: s.vehicleKills,
    teamkills: s.teamkills,
    deaths: {
      total: s.deathsTotal,
      byTeamkills: s.deathsByTeamkills,
    },
    kdRatio: s.kdRatio,
    killsFromVehicleCoef: s.killsFromVehicleCoef,
    totalScore: s.totalScore,
    lastPlayedGameDate: s.lastPlayedGameDate.toISOString(),
    byWeeks: s.byWeeks.map((w) => ({
      week: w.week as WeekNumber,
      startDate: w.startDate.toISOString(),
      endDate: w.endDate.toISOString(),
      totalPlayedGames: w.totalPlayedGames,
      kills: w.kills,
      killsFromVehicle: w.killsFromVehicle,
      vehicleKills: w.vehicleKills,
      teamkills: w.teamkills,
      deaths: {
        total: w.deathsTotal,
        byTeamkills: w.deathsByTeamkills,
      },
      kdRatio: w.kdRatio,
      killsFromVehicleCoef: w.killsFromVehicleCoef,
      score: w.score,
    })),
    weapons: s.weapons,
    vehicles: s.vehicles,
    killed: addPrefixAndUpdateName(s.killed, namesInfo),
    killers: addPrefixAndUpdateName(s.killers, namesInfo),
    teamkilled: addPrefixAndUpdateName(s.teamkilled, namesInfo),
    teamkillers: addPrefixAndUpdateName(s.teamkillers, namesInfo),
  }));
};

/**
 * Sort statistics by score (descending) and apply standard ordering
 */
export const sortStatistics = (
  statistics: GlobalPlayerStatistics[],
): GlobalPlayerStatistics[] => {
  return orderBy(
    statistics,
    ['totalScore', 'kills', 'totalPlayedGames'],
    ['desc', 'desc', 'desc'],
  );
};
