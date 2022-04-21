import fs from 'fs';

import { endOfWeek, startOfWeek } from 'date-fns';

import { statsFolder } from './consts';

const generateJSONOutput = (statistics: GlobalPlayerStatistics[]): void => {
  const result = statistics.map((stats) => ({
    ...stats,
    byWeeks: stats.byWeeks.map((statsByWeek) => {
      const newStats = { ...statsByWeek };

      const startDate = startOfWeek(newStats.date).toJSON();
      const endDate = endOfWeek(newStats.date).toJSON();

      delete newStats.date;

      return {
        startDate,
        endDate,
        ...newStats,
      };
    }),
  }));

  fs.writeFileSync(`${statsFolder}/stats.json`, JSON.stringify(result, null, '\t'));
};

export default generateJSONOutput;
