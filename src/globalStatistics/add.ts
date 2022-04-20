import { getPlayerName } from '../utils';
import { defaultStatistics, playersToShowInStatistics } from './consts';

const addStatisticsToGlobalStatistics = (
  globalStatistics: GlobalPlayerStatistics[],
  playerGameResult: PlayerGameResult,
  gameInfo: GameInfo,
): GlobalPlayerStatistics[] => {
  if (!playersToShowInStatistics.includes(playerGameResult.name.toLowerCase())) {
    return globalStatistics;
  }

  const [playerName, squadPrefix] = getPlayerName(playerGameResult.name);
  let currentStatistics = globalStatistics.find(
    (playerStatistics) => playerStatistics.playerName === playerName.toLowerCase(),
  );

  if (!currentStatistics) {
    currentStatistics = {
      playerName,
      lastSquadPrefix: squadPrefix,
      ...defaultStatistics,
    };
  }

  const newStatistics: GlobalPlayerStatistics = {
    ...currentStatistics,
    lastSquadPrefix: squadPrefix,
    totalPlayedGames: currentStatistics.totalPlayedGames + 1,
    kills: currentStatistics.kills + playerGameResult.kills,
    teamkills: currentStatistics.teamkills + playerGameResult.teamkills,
    deaths: playerGameResult.isDead ? currentStatistics.deaths + 1 : currentStatistics.deaths,
  };
};

export default addStatisticsToGlobalStatistics;
