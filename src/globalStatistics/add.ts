import { getPlayerName } from '../utils';
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

  currentGlobalStatistics[currentStatisticsIndex] = {
    ...playerStatistics,
    lastSquadPrefix: squadPrefix,
    totalPlayedGames: playerStatistics.totalPlayedGames + 1,
    kills: playerStatistics.kills + playerGameResult.kills,
    teamkills: playerStatistics.teamkills + playerGameResult.teamkills,
    deaths: playerGameResult.isDead ? playerStatistics.deaths + 1 : playerStatistics.deaths,
    byWeeks: statisticsByWeek,
  };

  return currentGlobalStatistics;
};

export default addPlayerGameResultToGlobalStatistics;
