import fs from 'fs-extra';
import { isEmpty, omit, toPairs } from 'lodash';

import {
  globalStatsFileName,
  otherPlayersStatisticsFolder,
  squadFullRotationFileName,
  squadStatsFileName,
  weaponsStatisticsFolder,
  weeksStatisticsFolder,
} from './consts';

type Stats = Omit<Statistics, 'byRotations'>;

const createFileForEach = (path: string, data: Record<PlayerName, any>) => {
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
type OtherPlayersStatistics = Pick<GlobalPlayerStatistics, 'killed' | 'killers' | 'teamkilled' | 'teamkillers'>;

const generateJSONOutput = (statistics: Stats, folderPath: string): void => {
  const outputGlobalStats: OutputGlobalStatistics[] = statistics.global.map((stats) => omit(stats, ['byWeeks', 'weapons', 'vehicles']));

  const weaponsStatistics: Record<PlayerName, WeaponsStatistics> = {};
  const weeksStatistics: Record<PlayerName, GlobalPlayerWeekStatistics[]> = {};
  const otherPlayersStatistics: Record<PlayerName, OtherPlayersStatistics> = {};

  statistics.global.forEach(({
    name, weapons, vehicles, byWeeks, killed, killers, teamkilled, teamkillers,
  }) => {
    weaponsStatistics[name] = { firearms: weapons, vehicles };
    weeksStatistics[name] = byWeeks;
    otherPlayersStatistics[name] = {
      killed, killers, teamkilled, teamkillers,
    };
  });

  fs.writeFileSync(`${folderPath}/${globalStatsFileName}`, JSON.stringify(outputGlobalStats, null, '\t'));
  fs.writeFileSync(`${folderPath}/${squadStatsFileName}`, JSON.stringify(statistics.squad, null, '\t'));

  if (statistics.squadFull.length) fs.writeFileSync(`${folderPath}/${squadFullRotationFileName}`, JSON.stringify(statistics.squadFull, null, '\t'));

  createFileForEach(`${folderPath}/${weaponsStatisticsFolder}`, weaponsStatistics);
  createFileForEach(`${folderPath}/${weeksStatisticsFolder}`, weeksStatistics);
  createFileForEach(`${folderPath}/${otherPlayersStatisticsFolder}`, otherPlayersStatistics);
};

export default generateJSONOutput;
