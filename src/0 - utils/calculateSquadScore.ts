import round from 'lodash/round';
import sumBy from 'lodash/sumBy';

const calculateSquadScore = (statistics: GlobalPlayerStatistics[]) => (
  round(sumBy(statistics, 'totalScore') / statistics.length, 2)
);

export default calculateSquadScore;
