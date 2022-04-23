import fs from 'fs';

import { endOfWeek, startOfWeek } from 'date-fns';

import { statsFolder } from './consts';

// indent rule broken in this case
// https://github.com/typescript-eslint/typescript-eslint/issues/1824
/* eslint-disable @typescript-eslint/indent */
type JSONOutput = Array<
  Omit<GlobalPlayerStatistics, 'byWeeks'> & {
    byWeeks: Array<Omit<GlobalPlayerWeekStatistics, 'date'>>
  }
>;
/* eslint-enable @typescript-eslint/indent */

const generateJSONOutput = (statistics: StatisticsForOutput): void => {
  const result: JSONOutput = statistics.global.map((stats) => ({
    ...stats,
    byWeeks: stats.byWeeks.map((statsByWeek) => {
      const startDate = startOfWeek(statsByWeek.date).toJSON();
      const endDate = endOfWeek(statsByWeek.date).toJSON();

      const {
        week, totalPlayedGames, kills, teamkills, deaths, kdRatio, score,
      } = statsByWeek;

      return {
        startDate,
        endDate,
        week,
        totalPlayedGames,
        kills,
        teamkills,
        deaths,
        kdRatio,
        score,
      };
    }),
  }));

  fs.writeFileSync(`${statsFolder}/stats.json`, JSON.stringify(result, null, '\t'));
};

export default generateJSONOutput;
