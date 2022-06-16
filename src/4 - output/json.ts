import fs from 'fs';

import { endOfWeek } from 'date-fns';

import {
  dateFnsOptions, outputFolder, rotationsStatsFileName, statsFileName,
} from '../0 - consts';
import createFolder from '../0 - utils/createFolder';
import getWeekStartByWeekNumber from '../0 - utils/getWeekStartByWeekNumber';
import dateToUTC from '../0 - utils/utc';

const addDatesToByWeeks = (statistics: GlobalPlayerStatistics[]): GlobalOutputStatistics[] => (
  statistics.map((stats) => ({
    ...stats,
    byWeeks: stats.byWeeks.map((statsByWeek) => {
      const startDate = getWeekStartByWeekNumber(statsByWeek.week);
      const endDate = endOfWeek(startDate, dateFnsOptions);

      return {
        startDate: dateToUTC(startDate).toJSON(),
        endDate: dateToUTC(endDate).toJSON(),
        ...statsByWeek,
      };
    }),
  }))
);

const generateJSONOutput = (statistics: Statistics, folderName: string): void => {
  const folderPath = `${outputFolder}/${folderName}`;

  createFolder(folderPath);

  const globalStatistics = addDatesToByWeeks(statistics.global);

  const stats: OutputStatistics = {
    global: globalStatistics,
    squad: statistics.squad,
  };

  fs.writeFileSync(`${folderPath}/${statsFileName}`, JSON.stringify(stats, null, '\t'));

  if (statistics.byRotations) {
    const rotationStats: OutputStatisticsByRotation[] = statistics.byRotations.map(
      (statsByRotation) => ({
        ...statsByRotation,
        startDate: dateToUTC(statsByRotation.startDate).toJSON(),
        endDate: statsByRotation.endDate && dateToUTC(statsByRotation.endDate).toJSON(),
        stats: {
          ...statsByRotation.stats,
          global: addDatesToByWeeks(statsByRotation.stats.global),
        },
      }),
    );

    fs.writeFileSync(
      `${folderPath}/${rotationsStatsFileName}`,
      JSON.stringify(rotationStats, null, '\t'),
    );
  }
};

export default generateJSONOutput;
