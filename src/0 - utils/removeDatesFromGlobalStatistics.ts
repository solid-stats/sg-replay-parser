import { omit } from 'lodash';

const removeDatesFromGlobalStatistics = (globalStatistics: GlobalPlayerStatistics[]) => (
  globalStatistics.map((stats) => ({
    ...omit(stats, 'lastPlayedGameDate'),
    byWeeks: stats.byWeeks.map((weekStats) => omit(weekStats, ['week', 'startDate', 'endDate'])),
  }))
);

export default removeDatesFromGlobalStatistics;
