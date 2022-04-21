import { compareDesc } from 'date-fns';
import orderBy from 'lodash/orderBy';

const sortPlayerStatistics = (statistics: GlobalPlayerStatistics[]): GlobalPlayerStatistics[] => {
  const sortedStatisticsByScore = orderBy(statistics, 'totalScore', 'desc');
  const sortedStatistics = sortedStatisticsByScore.map((playerStatistics) => ({
    ...playerStatistics,
    byWeeks: playerStatistics.byWeeks.sort(
      (first, second) => compareDesc(first.date, second.date),
    ),
  }));

  return sortedStatistics;
};

export default sortPlayerStatistics;
