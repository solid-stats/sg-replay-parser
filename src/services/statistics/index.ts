/**
 * Statistics service exports
 */

export {
  calculateGlobalStatistics,
  calculateSquadStatistics,
  calculateGameTypeStatistics,
  calculateAllStatistics,
} from './calculateStatistics';
export type { GameTypeStatistics } from './calculateStatistics';
export { fetchPlayerResults, fetchAllPlayersResults, getPlayersWithResults } from './fetchPlayerResults';
export { aggregatePlayerStats, aggregateAllPlayersStats } from './aggregateStats';
export { toGlobalPlayerStatistics, sortStatistics } from './toOutputFormat';
export { calculateSquadStats } from './calculateSquadStats';
export type { AggregatedPlayerStats, WeekStats, CalculateStatsOptions, PlayerResultFromDB } from './types';
