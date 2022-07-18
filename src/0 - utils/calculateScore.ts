import round from 'lodash/round';

const calculateScore = (
  totalPlayedGames: GlobalPlayerStatistics['totalPlayedGames'],
  kills: GlobalPlayerStatistics['kills'],
  teamkills: GlobalPlayerStatistics['teamkills'],
  deaths: Deaths,
): GlobalPlayerStatistics['totalScore'] => {
  const totalScore = kills - teamkills;
  const gamesCount = totalPlayedGames - deaths.byTeamkills;

  if (gamesCount <= 0) return totalScore;

  return round(totalScore / gamesCount, 2);
};

export default calculateScore;
