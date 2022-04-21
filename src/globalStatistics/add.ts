import { getPlayerName } from '../utils';
import { defaultStatistics } from './consts';

const isSameNickName = (first: string, second: string) => (
  first.toLowerCase() === second.toLowerCase()
);

const addPlayerGameResultToGlobalStatistics = (
  globalStatistics: GlobalPlayerStatistics[],
  playerGameResult: PlayerGameResult,
  // date: Replay['date'],
): GlobalPlayerStatistics[] => {
  const currentGlobalStatistics = globalStatistics.slice();
  const [playerName, squadPrefix] = getPlayerName(playerGameResult.name);

  const currentStatisticsIndex = globalStatistics.findIndex(
    (playerStatistics) => (isSameNickName(playerStatistics.playerName, playerName)),
  );

  if (currentStatisticsIndex === -1) {
    currentGlobalStatistics.push({
      playerName,
      lastSquadPrefix: squadPrefix,
      ...defaultStatistics,
    });
  }

  const newStatistics = currentGlobalStatistics.map((playerStatistics) => {
    if (!isSameNickName(playerStatistics.playerName, playerName)) return playerStatistics;

    return {
      ...playerStatistics,
      lastSquadPrefix: squadPrefix,
      totalPlayedGames: playerStatistics.totalPlayedGames + 1,
      kills: playerStatistics.kills + playerGameResult.kills,
      teamkills: playerStatistics.teamkills + playerGameResult.teamkills,
      deaths: playerGameResult.isDead ? playerStatistics.deaths + 1 : playerStatistics.deaths,
    };
  });

  return newStatistics;
};

export default addPlayerGameResultToGlobalStatistics;
