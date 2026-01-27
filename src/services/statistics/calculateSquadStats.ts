/**
 * Squad statistics calculation
 * Aggregates player results by squad prefix
 */

import { round, orderBy } from 'lodash';

import calculateKDRatio from '../../shared/utils/calculateKDRatio';
import calculateScore from '../../shared/utils/calculateScore';
import calculateVehicleKillsCoef from '../../shared/utils/calculateVehicleKillsCoef';
import type { PlayerResultFromDB } from './types';

type SquadPlayerStats = {
  id: string;
  name: string;
  lastSquadPrefix: string;
  totalPlayedGames: number;
  kills: number;
  killsFromVehicle: number;
  killsFromVehicleCoef: number;
  vehicleKills: number;
  teamkills: number;
  deaths: Deaths;
  kdRatio: number;
  totalScore: number;
};

type SquadInfo = {
  name: string;
  gamesPlayed: number;
  playersCount: number;
  kills: number;
  teamkills: number;
  players: Record<string, SquadPlayerStats>;
  replayIds: Set<string>;
};

const getEmptySquad = (prefix: string): SquadInfo => ({
  name: prefix,
  gamesPlayed: 0,
  playersCount: 0,
  kills: 0,
  teamkills: 0,
  players: {},
  replayIds: new Set(),
});

const getEmptyPlayer = (
  id: string,
  name: string,
  prefix: string,
): SquadPlayerStats => ({
  id,
  name,
  lastSquadPrefix: prefix,
  totalPlayedGames: 0,
  kills: 0,
  killsFromVehicle: 0,
  killsFromVehicleCoef: 0,
  vehicleKills: 0,
  teamkills: 0,
  deaths: { total: 0, byTeamkills: 0 },
  kdRatio: 0,
  totalScore: 0,
});

/**
 * Calculate deaths from player result
 */
const calculateDeaths = (
  currentDeaths: Deaths,
  isDead: boolean,
  isDeadByTeamkill: boolean,
): Deaths => {
  const total = currentDeaths.total + (isDead ? 1 : 0);
  const byTeamkills = currentDeaths.byTeamkills + (isDeadByTeamkill ? 1 : 0);

  return { total, byTeamkills };
};

/**
 * Calculate squad statistics from player results
 */
export const calculateSquadStats = (
  results: PlayerResultFromDB[],
): GlobalSquadStatistics[] => {
  const squads: Record<string, SquadInfo> = {};

  // Group results by replay to track games played per squad
  const resultsByReplay = new Map<string, PlayerResultFromDB[]>();

  for (const result of results) {
    const existing = resultsByReplay.get(result.replayId) || [];

    existing.push(result);
    resultsByReplay.set(result.replayId, existing);
  }

  // Process each replay
  for (const [replayId, replayResults] of resultsByReplay) {
    const squadsInReplay: string[] = [];

    for (const result of replayResults) {
      const prefix = result.squadPrefix;

      if (!prefix) continue;

      const isSquadAlreadyInReplay = squadsInReplay.includes(prefix);

      if (!isSquadAlreadyInReplay) {
        squadsInReplay.push(prefix);
      }

      if (!squads[prefix]) {
        squads[prefix] = getEmptySquad(prefix);
      }

      const squadPlayer = squads[prefix].players[result.playerId]
        || getEmptyPlayer(result.playerId, result.entityName, prefix);

      // Calculate player stats
      const deaths = calculateDeaths(
        squadPlayer.deaths,
        result.isDead,
        result.isDeadByTeamkill,
      );
      const totalPlayedGames = squadPlayer.totalPlayedGames + 1;
      const kills = squadPlayer.kills + result.kills;
      const killsFromVehicle = squadPlayer.killsFromVehicle + result.killsFromVehicle;
      const teamkills = squadPlayer.teamkills + result.teamkills;

      // Update squad totals
      squads[prefix].playersCount += 1;
      squads[prefix].kills += result.kills;
      squads[prefix].teamkills += result.teamkills;

      // Update player in squad
      squads[prefix].players[result.playerId] = {
        id: result.playerId,
        name: result.entityName,
        lastSquadPrefix: prefix,
        totalPlayedGames,
        kills,
        killsFromVehicle,
        killsFromVehicleCoef: calculateVehicleKillsCoef(kills, killsFromVehicle),
        vehicleKills: squadPlayer.vehicleKills + result.vehicleKills,
        teamkills,
        deaths,
        kdRatio: calculateKDRatio(kills, teamkills, deaths),
        totalScore: calculateScore(totalPlayedGames, kills, teamkills, deaths),
      };
    }

    // Mark games played for squads in this replay
    for (const prefix of squadsInReplay) {
      if (!squads[prefix].replayIds.has(replayId)) {
        squads[prefix].gamesPlayed += 1;
        squads[prefix].replayIds.add(replayId);
      }
    }
  }

  // Convert to output format
  const result: GlobalSquadStatistics[] = [];

  for (const prefix of Object.keys(squads)) {
    const squadInfo = squads[prefix];
    const players = Object.values(squadInfo.players);

    // Skip squads with <= 4 players
    if (players.length <= 4) continue;

    const averageKills = squadInfo.gamesPlayed > 0
      ? squadInfo.kills / squadInfo.gamesPlayed
      : 0;
    const averageTeamkills = squadInfo.kills > 0
      ? squadInfo.teamkills / squadInfo.kills
      : 0;
    const averagePlayersCount = squadInfo.gamesPlayed > 0
      ? squadInfo.playersCount / squadInfo.gamesPlayed
      : 0;

    result.push({
      prefix: squadInfo.name,
      kills: squadInfo.kills,
      averageKills: round(averageKills, 2),
      teamkills: squadInfo.teamkills,
      averageTeamkills: round(averageTeamkills, 2),
      averagePlayersCount: round(averagePlayersCount, 2),
      score: averagePlayersCount > 0
        ? round(averageKills / averagePlayersCount, 2)
        : 0,
      players: orderBy(
        players,
        ['totalScore', 'kills', 'totalPlayedGames'],
        ['desc', 'desc', 'desc'],
      ),
    });
  }

  // Sort by score
  return orderBy(
    result,
    ['score', 'averagePlayersCount', 'averageKills'],
    ['desc', 'desc', 'desc'],
  );
};
