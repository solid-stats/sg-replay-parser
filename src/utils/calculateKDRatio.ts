import round from 'lodash/round';

const calculateKDRatio = (
  kills: GlobalPlayerStatistics['kills'],
  deaths: GlobalPlayerStatistics['deaths'],
): GlobalPlayerStatistics['kdRatio'] => {
  const deathsWithoutByTeamkills = deaths.total - deaths.byTeamkills;

  if (!deathsWithoutByTeamkills) return kills;

  return round(kills / (deaths.total - deaths.byTeamkills), 2);
};

export default calculateKDRatio;
