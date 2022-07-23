import calculateKDRatio from '../../0 - utils/calculateKDRatio';
import calculateScore from '../../0 - utils/calculateScore';
import getPlayerName from '../../0 - utils/getPlayerName';
import { unionWeaponsStatistic } from '../../0 - utils/weaponsStatistic';
import { defaultStatistics } from '../consts';
import addPlayerGameResultToWeekStatistics from './addToResultsByWeek';
import { calculateDeaths } from './utils';

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
      lastPlayedGameDate: date,
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

  if (playerGameResult.vehicleKills > 0) console.log(playerStatistics);
  const vehicleKills = playerStatistics.vehicleKills + playerGameResult.vehicleKills;
  const teamkills = playerStatistics.teamkills + playerGameResult.teamkills;

  const currentDeaths: Deaths = {
    total: playerStatistics.deaths.total,
    byTeamkills: playerStatistics.deaths.byTeamkills,
  };

  const deaths = calculateDeaths({
    deaths: currentDeaths,
    isDead: playerGameResult.isDead,
    isDeadByTeamkill: playerGameResult.isDeadByTeamkill,
  });

  currentGlobalStatistics[currentStatisticsIndex] = {
    ...playerStatistics,
    lastSquadPrefix: squadPrefix,
    lastPlayedGameDate: date,
    totalPlayedGames,
    kills,
    vehicleKills,
    teamkills,
    deaths,
    kdRatio: calculateKDRatio(kills, teamkills, deaths),
    totalScore: calculateScore(totalPlayedGames, kills, teamkills, deaths),
    weapons: unionWeaponsStatistic(playerStatistics.weapons, playerGameResult.weapons),
    byWeeks: statisticsByWeek,
  };

  return currentGlobalStatistics;
};

export default addPlayerGameResultToGlobalStatistics;
