import fs from 'fs';

import { endOfWeek } from 'date-fns';

import { dateFnsOptions, outputFolder } from '../0 - consts';
import createFolder from '../0 - utils/createFolder';
import getWeekStartByWeekNumber from '../0 - utils/getWeekStartByWeekNumber';
import dateToUTC from '../0 - utils/utc';

const addDatesToByWeeks = (statistics: GlobalPlayerStatistics[]): GlobalPlayerStatistics[] => (
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

  const stats = {
    globalStatistics,
    squadStatistics: statistics.squad,
  };

  fs.writeFileSync(`${folderPath}/stats.json`, JSON.stringify(stats, null, '\t'));

  if (statistics.byRotations) {
    const rotationStats = statistics.byRotations.map((statsByRotation) => ({
      ...statsByRotation,
      startDate: dateToUTC(statsByRotation.startDate).toJSON(),
      endDate: statsByRotation.endDate && dateToUTC(statsByRotation.endDate).toJSON(),
      stats: {
        ...statsByRotation.stats,
        global: addDatesToByWeeks(statsByRotation.stats.global),
      },
    }));

    fs.writeFileSync(`${folderPath}/rotations_stats.json`, JSON.stringify(rotationStats, null, '\t'));
  }
};

export default generateJSONOutput;
