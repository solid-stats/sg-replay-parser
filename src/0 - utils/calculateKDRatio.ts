import { round } from 'lodash';

const calculateKDRatio = (
  kills: GlobalPlayerStatistics['kills'],
  teamkills: GlobalPlayerStatistics['teamkills'],
  deaths: GlobalPlayerStatistics['deaths'],
): GlobalPlayerStatistics['kdRatio'] => {
  const deathsWithoutByTeamkills = Math.abs(deaths.total - deaths.byTeamkills);

  if (!deathsWithoutByTeamkills) return kills - teamkills;

  return round((kills - teamkills) / deathsWithoutByTeamkills, 2);
};

export default calculateKDRatio;
