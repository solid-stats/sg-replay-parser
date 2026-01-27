/**
 * Aggregate player statistics from database results
 */

import { round, orderBy } from 'lodash';

import calculateKDRatio from '../../shared/utils/calculateKDRatio';
import calculateScore from '../../shared/utils/calculateScore';
import calculateVehicleKillsCoef from '../../shared/utils/calculateVehicleKillsCoef';
import { dayjsUTC } from '../../shared/utils/dayjs';
import mergeOtherPlayers from '../../shared/utils/mergeOtherPlayers';
import { unionWeaponsStatistic } from '../../shared/utils/weaponsStatistic';
import type { PlayerResultFromDB, AggregatedPlayerStats, WeekStats } from './types';

/**
 * Parse JSON fields from database result
 */
const parseJsonField = <T>(jsonString: string): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return [] as unknown as T;
  }
};

/**
 * Get week key from date in format YYYY-WW
 */
const getWeekKey = (date: Date): string => dayjsUTC(date.toISOString()).format('GGGG-WW');

/**
 * Aggregate single player's statistics from their game results
 */
export const aggregatePlayerStats = (
  results: PlayerResultFromDB[],
): AggregatedPlayerStats | null => {
  if (results.length === 0) return null;

  // Sort by date to get correct last values
  const sortedResults = orderBy(results, (r) => r.replay.date.getTime(), 'asc');
  const lastResult = sortedResults[sortedResults.length - 1];

  // Aggregate totals
  let totalPlayedGames = 0;
  let kills = 0;
  let killsFromVehicle = 0;
  let vehicleKills = 0;
  let teamkills = 0;
  let deathsTotal = 0;
  let deathsByTeamkills = 0;

  let weapons: WeaponStatistic[] = [];
  let vehicles: WeaponStatistic[] = [];
  let killed: OtherPlayer[] = [];
  let killers: OtherPlayer[] = [];
  let teamkilled: OtherPlayer[] = [];
  let teamkillers: OtherPlayer[] = [];

  const weekStatsMap = new Map<string, WeekStats>();

  for (const result of sortedResults) {
    totalPlayedGames += 1;
    kills += result.kills;
    killsFromVehicle += result.killsFromVehicle;
    vehicleKills += result.vehicleKills;
    teamkills += result.teamkills;

    if (result.isDead) {
      deathsTotal += 1;

      if (result.isDeadByTeamkill) {
        deathsByTeamkills += 1;
      }
    }

    // Merge weapons and vehicles
    weapons = unionWeaponsStatistic(weapons, parseJsonField<WeaponStatistic[]>(result.weapons));
    vehicles = unionWeaponsStatistic(vehicles, parseJsonField<WeaponStatistic[]>(result.vehicles));

    // Merge interactions
    killed = mergeOtherPlayers(killed, parseJsonField<OtherPlayer[]>(result.killed));
    killers = mergeOtherPlayers(killers, parseJsonField<OtherPlayer[]>(result.killers));
    teamkilled = mergeOtherPlayers(teamkilled, parseJsonField<OtherPlayer[]>(result.teamkilled));
    teamkillers = mergeOtherPlayers(teamkillers, parseJsonField<OtherPlayer[]>(result.teamkillers));

    // Weekly stats
    const weekKey = getWeekKey(result.replay.date);
    const gameDate = dayjsUTC(result.replay.date.toISOString());
    const existingWeek = weekStatsMap.get(weekKey);

    if (existingWeek) {
      const newDeathsTotal = existingWeek.deathsTotal + (result.isDead ? 1 : 0);
      const newDeathsByTeamkills = existingWeek.deathsByTeamkills + (result.isDeadByTeamkill ? 1 : 0);
      const newKills = existingWeek.kills + result.kills;
      const newKillsFromVehicle = existingWeek.killsFromVehicle + result.killsFromVehicle;
      const newTeamkills = existingWeek.teamkills + result.teamkills;
      const newTotalPlayedGames = existingWeek.totalPlayedGames + 1;

      const deaths: Deaths = {
        total: newDeathsTotal,
        byTeamkills: newDeathsByTeamkills,
      };

      existingWeek.totalPlayedGames = newTotalPlayedGames;
      existingWeek.kills = newKills;
      existingWeek.killsFromVehicle = newKillsFromVehicle;
      existingWeek.vehicleKills += result.vehicleKills;
      existingWeek.teamkills = newTeamkills;
      existingWeek.deathsTotal = newDeathsTotal;
      existingWeek.deathsByTeamkills = newDeathsByTeamkills;
      existingWeek.kdRatio = calculateKDRatio(newKills, newTeamkills, deaths);
      existingWeek.killsFromVehicleCoef = calculateVehicleKillsCoef(newKills, newKillsFromVehicle);
      existingWeek.score = calculateScore(newTotalPlayedGames, newKills, newTeamkills, deaths);
    } else {
      const initialDeaths: Deaths = {
        total: result.isDead ? 1 : 0,
        byTeamkills: result.isDeadByTeamkill ? 1 : 0,
      };

      weekStatsMap.set(weekKey, {
        week: weekKey,
        startDate: gameDate.startOf('isoWeek').toDate(),
        endDate: gameDate.endOf('isoWeek').toDate(),
        totalPlayedGames: 1,
        kills: result.kills,
        killsFromVehicle: result.killsFromVehicle,
        vehicleKills: result.vehicleKills,
        teamkills: result.teamkills,
        deathsTotal: initialDeaths.total,
        deathsByTeamkills: initialDeaths.byTeamkills,
        kdRatio: calculateKDRatio(result.kills, result.teamkills, initialDeaths),
        killsFromVehicleCoef: calculateVehicleKillsCoef(result.kills, result.killsFromVehicle),
        score: calculateScore(1, result.kills, result.teamkills, initialDeaths),
      });
    }
  }

  const deaths: Deaths = {
    total: deathsTotal,
    byTeamkills: deathsByTeamkills,
  };

  // Sort and limit weapons/vehicles to top 25
  const sortedWeapons = orderBy(weapons, 'kills', 'desc').slice(0, 25);
  const sortedVehicles = orderBy(vehicles, 'kills', 'desc').slice(0, 25);

  // Sort and limit interactions to top 10
  const sortedKilled = orderBy(killed, 'count', 'desc').slice(0, 10);
  const sortedKillers = orderBy(killers, 'count', 'desc').slice(0, 10);
  const sortedTeamkilled = orderBy(teamkilled, 'count', 'desc').slice(0, 10);
  const sortedTeamkillers = orderBy(teamkillers, 'count', 'desc').slice(0, 10);

  // Sort weekly stats by date descending
  const byWeeks = orderBy(Array.from(weekStatsMap.values()), 'startDate', 'desc');

  return {
    playerId: lastResult.playerId,
    name: lastResult.entityName,
    lastSquadPrefix: lastResult.squadPrefix,
    totalPlayedGames,
    kills,
    killsFromVehicle,
    vehicleKills,
    teamkills,
    deathsTotal,
    deathsByTeamkills,
    kdRatio: calculateKDRatio(kills, teamkills, deaths),
    killsFromVehicleCoef: calculateVehicleKillsCoef(kills, killsFromVehicle),
    totalScore: calculateScore(totalPlayedGames, kills, teamkills, deaths),
    lastPlayedGameDate: lastResult.replay.date,
    isShow: true,
    byWeeks,
    weapons: sortedWeapons,
    vehicles: sortedVehicles,
    killed: sortedKilled,
    killers: sortedKillers,
    teamkilled: sortedTeamkilled,
    teamkillers: sortedTeamkillers,
  };
};

/**
 * Aggregate all players' statistics
 */
export const aggregateAllPlayersStats = (
  resultsByPlayer: Map<string, PlayerResultFromDB[]>,
): AggregatedPlayerStats[] => {
  const stats: AggregatedPlayerStats[] = [];

  for (const [, results] of resultsByPlayer) {
    const playerStats = aggregatePlayerStats(results);

    if (playerStats) {
      stats.push(playerStats);
    }
  }

  // Sort by score descending, then by kills descending
  return orderBy(stats, ['totalScore', 'kills'], ['desc', 'desc']);
};
