import fs from 'fs';

import { isEmpty, omit, toPairs } from 'lodash';

import {
  globalStatsFileName, squadStatsFileName, weaponsStatisticsFolder, weeksStatisticsFolder,
} from './consts';

type Stats = Omit<Statistics, 'byRotations'>;

const createFileForEach = (path: string, data: Record<string, any>) => {
  if (isEmpty(data)) return;

  fs.mkdirSync(path);

  toPairs(data).forEach(([key, value]) => (
    fs.writeFileSync(`${path}/${key}.json`, JSON.stringify(value, null, '\t'))
  ));
};

type WeaponsStatistics = {
  firearms: WeaponStatistic[];
  vehicles: WeaponStatistic[];
};

const generateJSONOutput = (statistics: Stats, folderPath: string): void => {
  const outputGlobalStats: OutputGlobalStatistics[] = statistics.global.map((stats) => omit(stats, ['byWeeks', 'weapons', 'vehicles']));

  const weaponsStatistics: Record<PlayerName, WeaponsStatistics> = {};
  const weeksStatistics: Record<PlayerName, GlobalPlayerWeekStatistics[]> = {};

  statistics.global.forEach(({
    name, weapons, vehicles, byWeeks,
  }) => {
    weaponsStatistics[name] = { firearms: weapons, vehicles };
    weeksStatistics[name] = byWeeks;
  });

  fs.writeFileSync(`${folderPath}/${globalStatsFileName}`, JSON.stringify(outputGlobalStats, null, '\t'));
  fs.writeFileSync(`${folderPath}/${squadStatsFileName}`, JSON.stringify(statistics.squad, null, '\t'));

  createFileForEach(`${folderPath}/${weaponsStatisticsFolder}`, weaponsStatistics);
  createFileForEach(`${folderPath}/${weeksStatisticsFolder}`, weaponsStatistics);
};

export default generateJSONOutput;
