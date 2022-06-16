import fs from 'fs';

import omit from 'lodash/omit';

import {
  gameTypes, outputFolder, rotationsStatsFileName, statsFileName,
} from '../0 - consts';

const removeDates = (byWeeks: ByWeeksOutputStatistics[]): GlobalPlayerWeekStatistics[] => (
  byWeeks.map((stats) => omit(stats, ['startDate', 'endDate']))
);

const removeDatesFromGlobalStatistics = (
  statistics: GlobalOutputStatistics[],
): GlobalPlayerStatistics[] => (
  statistics.map((stat) => ({
    ...stat,
    byWeeks: removeDates(stat.byWeeks),
  }))
);

const processStats = (
  statistics: OutputStatistics,
  statisticsByRotations?: OutputStatisticsByRotation[],
): Statistics => {
  const global: GlobalPlayerStatistics[] = removeDatesFromGlobalStatistics(statistics.global);
  let byRotations: Statistics['byRotations'] = null;

  if (statisticsByRotations) {
    byRotations = statisticsByRotations.map((rotation) => ({
      ...rotation,
      startDate: new Date(rotation.startDate),
      endDate: rotation.endDate === null ? null : new Date(rotation.endDate),
      stats: {
        ...rotation.stats,
        global: removeDatesFromGlobalStatistics(rotation.stats.global),
      },
    }));
  }

  return {
    global,
    squad: statistics.squad,
    byRotations,
  };
};

const getAlreadyParsedStats = (): Record<GameType, Statistics> => {
  const folderNames = gameTypes.slice();

  const [sgStats, maceStats]: OutputStatistics[] = folderNames.map((folderName) => (
    JSON.parse(fs.readFileSync(`${outputFolder}/${folderName}/${statsFileName}`, 'utf8'))
  ));

  const rotationsStats: OutputStatisticsByRotation[] = JSON.parse(
    fs.readFileSync(`${outputFolder}/sg/${rotationsStatsFileName}`, 'utf8'),
  );

  return {
    sg: processStats(sgStats, rotationsStats),
    mace: processStats(maceStats),
  };
};

export default getAlreadyParsedStats;
