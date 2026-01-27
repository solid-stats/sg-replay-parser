/**
 * Output generation service
 * Generates JSON files for the statistics server
 */

import path from 'path';
import fs from 'fs-extra';
import { isEmpty, omit, toPairs } from 'lodash';

import { resultsPath, tempResultsPath } from '../../shared/utils/paths';
import {
  archiveFiles,
  globalStatsFileName,
  squadStatsFileName,
  squadFullRotationFileName,
  weaponsStatisticsFolder,
  weeksStatisticsFolder,
  otherPlayersStatisticsFolder,
  allTimeFolder,
} from '../../modules/output';
import type { GameTypeStatistics } from '../statistics';

type WeaponsStatistics = {
  firearms: WeaponStatistic[];
  vehicles: WeaponStatistic[];
};

type OtherPlayersStatistics = Pick<
  GlobalPlayerStatistics,
  'killed' | 'killers' | 'teamkilled' | 'teamkillers'
>;

/**
 * Create a JSON file for each entry in the data object
 */
const createFileForEach = (
  folderPath: string,
  data: Record<string, unknown>,
): void => {
  if (isEmpty(data)) return;

  fs.mkdirSync(folderPath, { recursive: true });

  toPairs(data).forEach(([key, value]) => {
    fs.writeFileSync(
      `${folderPath}/${key}.json`,
      JSON.stringify(value, null, '\t'),
    );
  });
};

/**
 * Generate JSON output for a game type's statistics
 */
export const generateGameTypeOutput = (
  stats: GameTypeStatistics,
  folderPath: string,
): void => {
  // Create output directory
  fs.mkdirSync(folderPath, { recursive: true });

  // Create OutputGlobalStatistics (without byWeeks, weapons, vehicles)
  const outputGlobalStats: OutputGlobalStatistics[] = stats.global.map((s) =>
    omit(s, ['byWeeks', 'weapons', 'vehicles']),
  );

  // Prepare per-player statistics
  const weaponsStatistics: Record<string, WeaponsStatistics> = {};
  const weeksStatistics: Record<string, GlobalPlayerWeekStatistics[]> = {};
  const otherPlayersStatistics: Record<string, OtherPlayersStatistics> = {};

  stats.global.forEach(({
    name,
    weapons,
    vehicles,
    byWeeks,
    killed,
    killers,
    teamkilled,
    teamkillers,
  }) => {
    weaponsStatistics[name] = { firearms: weapons, vehicles };
    weeksStatistics[name] = byWeeks;
    otherPlayersStatistics[name] = {
      killed,
      killers,
      teamkilled,
      teamkillers,
    };
  });

  // Write main files
  fs.writeFileSync(
    path.join(folderPath, globalStatsFileName),
    JSON.stringify(outputGlobalStats, null, '\t'),
  );

  // Write squad statistics
  fs.writeFileSync(
    path.join(folderPath, squadStatsFileName),
    JSON.stringify(stats.squad, null, '\t'),
  );

  // Write squad full statistics (if different from squad)
  if (stats.squadFull.length > 0) {
    fs.writeFileSync(
      path.join(folderPath, squadFullRotationFileName),
      JSON.stringify(stats.squadFull, null, '\t'),
    );
  }

  // Create per-player statistics folders
  createFileForEach(
    path.join(folderPath, weaponsStatisticsFolder),
    weaponsStatistics,
  );
  createFileForEach(
    path.join(folderPath, weeksStatisticsFolder),
    weeksStatistics,
  );
  createFileForEach(
    path.join(folderPath, otherPlayersStatisticsFolder),
    otherPlayersStatistics,
  );
};

/**
 * Generate output for all game types
 */
export const generateAllOutput = async (stats: {
  sg: GameTypeStatistics;
  mace: GameTypeStatistics;
}): Promise<void> => {
  // Clean temp directory
  fs.removeSync(tempResultsPath);

  // Create folder structure
  const sgPath = path.join(tempResultsPath, 'sg', allTimeFolder);
  const macePath = path.join(tempResultsPath, 'mace', allTimeFolder);
  const smPath = path.join(tempResultsPath, 'sm', allTimeFolder);

  // Generate output
  generateGameTypeOutput(stats.sg, sgPath);
  generateGameTypeOutput(stats.mace, macePath);

  // Create empty SM folder for compatibility
  fs.mkdirSync(smPath, { recursive: true });
  fs.writeFileSync(
    path.join(smPath, globalStatsFileName),
    JSON.stringify([], null, '\t'),
  );
  fs.writeFileSync(
    path.join(smPath, squadStatsFileName),
    JSON.stringify([], null, '\t'),
  );

  // Archive files
  await archiveFiles(['sg', 'mace', 'sm']);

  // Replace results
  fs.removeSync(resultsPath);
  fs.moveSync(tempResultsPath, resultsPath);
};
