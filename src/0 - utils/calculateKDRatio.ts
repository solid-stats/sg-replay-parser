import round from 'lodash/round';

const calculateKDRatio = (
  kills: GlobalPlayerStatistics['kills'],
  teamkills: GlobalPlayerStatistics['teamkills'],
  deaths: GlobalPlayerStatistics['deaths'],
): GlobalPlayerStatistics['kdRatio'] => {
  const deathsWithoutByTeamkills = deaths.total - deaths.byTeamkills;
  // const deathsWithoutByTeamkills = Math.abs(deaths.total - deaths.byTeamkills);

  if (!deathsWithoutByTeamkills) return kills;

  return round((kills - teamkills) / deathsWithoutByTeamkills, 2);
};

export default calculateKDRatio;
