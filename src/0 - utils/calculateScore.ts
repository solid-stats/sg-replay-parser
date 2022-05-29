import round from 'lodash/round';

const calculateScore = (
  totalPlayedGames: GlobalPlayerStatistics['totalPlayedGames'],
  kills: GlobalPlayerStatistics['kills'],
  teamkills: GlobalPlayerStatistics['teamkills'],
): GlobalPlayerStatistics['totalScore'] => {
  const totalScore = kills - teamkills;
  const scoreDividedByTotalPlayedGames = totalScore / totalPlayedGames;

  return round(scoreDividedByTotalPlayedGames, 2);
};

export default calculateScore;
