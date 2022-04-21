import calculateScore from '../utils/calculateScore';
import getPlayerName from '../utils/getPlayerName';
import addPlayerGameResultToWeekStatistics from './addToResultsByWeek';
import { defaultStatistics } from './consts';

const isSameNickName = (first: string, second: string) => (
  first.toLowerCase() === second.toLowerCase()
);

const addPlayerGameResultToGlobalStatistics = (
  globalStatistics: GlobalPlayerStatistics[],
  playerGameResult: PlayerGameResult,
  date: Replay['date'],
): GlobalPlayerStatistics[] => {
  const currentGlobalStatistics = globalStatistics.slice();
  const [playerName, squadPrefix] = getPlayerName(playerGameResult.name);
  let currentStatisticsIndex = globalStatistics.findIndex(
    (playerStatistics) => (isSameNickName(playerStatistics.playerName, playerName)),
  );

  if (currentStatisticsIndex === -1) {
    const newArrLength = currentGlobalStatistics.push({
      playerName,
      lastSquadPrefix: squadPrefix,
      ...defaultStatistics,
    });

    currentStatisticsIndex = newArrLength - 1;
  }

  const playerStatistics = currentGlobalStatistics[currentStatisticsIndex];
  const statisticsByWeek = addPlayerGameResultToWeekStatistics(
    playerStatistics.byWeeks,
    playerGameResult,
    date,
  );

  const totalPlayedGames = playerStatistics.totalPlayedGames + 1;
  const kills = playerStatistics.kills + playerGameResult.kills;
  const teamkills = playerStatistics.teamkills + playerGameResult.teamkills;

  currentGlobalStatistics[currentStatisticsIndex] = {
    ...playerStatistics,
    lastSquadPrefix: squadPrefix,
    totalPlayedGames,
    kills,
    teamkills,
    deaths: playerGameResult.isDead ? playerStatistics.deaths + 1 : playerStatistics.deaths,
    byWeeks: statisticsByWeek,
    totalScore: calculateScore(totalPlayedGames, kills, teamkills),
  };

  return currentGlobalStatistics;
};

export default addPlayerGameResultToGlobalStatistics;
