import fs from 'fs';

import { endOfWeek } from 'date-fns';

import { dateFnsOptions } from '../consts';
import getWeekStartByWeekNumber from '../utils/getWeekStartByWeekNumber';
import dateToUTC from '../utils/utc';
import { statsFolder } from './consts';

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

const generateJSONOutput = (statistics: Statistics, prefix: string): void => {
  const globalStatistics = addDatesToByWeeks(statistics.global);

  const stats = {
    globalStatistics,
    squadStatistics: statistics.squad,
  };

  fs.writeFileSync(`${statsFolder}/${prefix}_stats.json`, JSON.stringify(stats, null, '\t'));

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

    fs.writeFileSync(`${statsFolder}/${prefix}_rotations_stats.json`, JSON.stringify(rotationStats, null, '\t'));
  }
};

export default generateJSONOutput;
