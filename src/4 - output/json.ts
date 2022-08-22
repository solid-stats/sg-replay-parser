import fs from 'fs';

import { omit, toPairs } from 'lodash';

import {
  globalStatsFileName, squadStatsFileName, weaponsStatisticsFolder, weeksStatisticsFolder,
} from './consts';

type Stats = Omit<Statistics, 'byRotations'>;

const generateJSONOutput = (statistics: Stats, folderPath: string): void => {
  const outputGlobalStats: OutputGlobalStatistics[] = statistics.global.map((stats) => omit(stats, ['byWeeks', 'weapons']));

  const weaponsStatistics: Record<PlayerName, WeaponStatistic[]> = {};
  const weeksStatistics: Record<PlayerName, GlobalPlayerWeekStatistics[]> = {};

  statistics.global.forEach(({ name, weapons, byWeeks }) => {
    weaponsStatistics[name] = weapons;
    weeksStatistics[name] = byWeeks;
  });

  fs.writeFileSync(`${folderPath}/${globalStatsFileName}`, JSON.stringify(outputGlobalStats, null, '\t'));
  fs.writeFileSync(`${folderPath}/${squadStatsFileName}`, JSON.stringify(statistics.squad, null, '\t'));

  if (Object.values(weaponsStatistics).length > 0) {
    const weaponsStatisticsFolderPath = `${folderPath}/${weaponsStatisticsFolder}`;

    fs.mkdirSync(weaponsStatisticsFolderPath);

    toPairs(weaponsStatistics).forEach(([playerName, stats]) => (
      fs.writeFileSync(`${weaponsStatisticsFolderPath}/${playerName}.json`, JSON.stringify(stats, null, '\t'))
    ));
  }

  if (Object.values(weeksStatistics).length > 0) {
    const weeksStatisticsFolderPath = `${folderPath}/${weeksStatisticsFolder}`;

    fs.mkdirSync(weeksStatisticsFolderPath);

    toPairs(weeksStatistics).forEach(([playerName, stats]) => (
      fs.writeFileSync(`${weeksStatisticsFolderPath}/${playerName}.json`, JSON.stringify(stats, null, '\t'))
    ));
  }
};

export default generateJSONOutput;
