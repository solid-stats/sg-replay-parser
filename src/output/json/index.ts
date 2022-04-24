import fs from 'fs';

import { endOfWeek, startOfWeek } from 'date-fns';
import omit from 'lodash/omit';

import { statsFolder } from '../consts';

const generateJSONOutput = (statistics: StatisticsForOutput): void => {
  const globalStatistics = statistics.global.map((stats) => ({
    ...stats,
    byWeeks: stats.byWeeks.map((statsByWeek) => {
      const startDate = startOfWeek(statsByWeek.date, { weekStartsOn: 1 }).toJSON();
      const endDate = endOfWeek(statsByWeek.date, { weekStartsOn: 1 }).toJSON();

      return {
        startDate,
        endDate,
        ...omit(statsByWeek, 'date'),
      };
    }),
  }));

  const result = {
    globalStatistics,
    squadStatistics: statistics.squad,
  };

  fs.writeFileSync(`${statsFolder}/stats.json`, JSON.stringify(result, null, '\t'));
};

export default generateJSONOutput;
