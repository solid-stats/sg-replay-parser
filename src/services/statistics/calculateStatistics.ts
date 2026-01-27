/**
 * Main statistics calculation service
 * Calculates player statistics from parsed replay results in database
 */

import { GameType } from '../../generated/prisma/enums';
import { fetchAllPlayersResults, fetchPlayerResults } from './fetchPlayerResults';
import { aggregateAllPlayersStats } from './aggregateStats';
import { toGlobalPlayerStatistics, sortStatistics } from './toOutputFormat';
import { calculateSquadStats } from './calculateSquadStats';

export type CalculateStatisticsOptions = {
  gameType: GameType;
};

export type GameTypeStatistics = {
  global: GlobalPlayerStatistics[];
  squad: GlobalSquadStatistics[];
  squadFull: GlobalSquadStatistics[];
};

/**
 * Calculate global player statistics for a game type
 * Returns statistics in the same format as the existing system
 */
export const calculateGlobalStatistics = async (
  options: CalculateStatisticsOptions,
): Promise<GlobalPlayerStatistics[]> => {
  // Fetch all player results from database
  const resultsByPlayer = await fetchAllPlayersResults(options.gameType);

  // Aggregate statistics
  const aggregatedStats = aggregateAllPlayersStats(resultsByPlayer);

  // Convert to output format
  const globalStats = toGlobalPlayerStatistics(aggregatedStats);

  // Sort by score
  return sortStatistics(globalStats);
};

/**
 * Calculate squad statistics for a game type
 */
export const calculateSquadStatistics = async (
  options: CalculateStatisticsOptions,
): Promise<GlobalSquadStatistics[]> => {
  const results = await fetchPlayerResults({ gameType: options.gameType });

  return calculateSquadStats(results);
};

/**
 * Calculate all statistics (global + squad) for a game type
 */
export const calculateGameTypeStatistics = async (
  options: CalculateStatisticsOptions,
): Promise<GameTypeStatistics> => {
  const [global, squad] = await Promise.all([
    calculateGlobalStatistics(options),
    calculateSquadStatistics(options),
  ]);

  // squadFull is the same as squad for now (no 4-week filter in new system)
  return { global, squad, squadFull: squad };
};

/**
 * Calculate statistics for all game types
 */
export const calculateAllStatistics = async (): Promise<{
  sg: GameTypeStatistics;
  mace: GameTypeStatistics;
}> => {
  const [sg, mace] = await Promise.all([
    calculateGameTypeStatistics({ gameType: 'SG' }),
    calculateGameTypeStatistics({ gameType: 'MACE' }),
  ]);

  return { sg, mace };
};
