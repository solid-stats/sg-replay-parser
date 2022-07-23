import { format } from 'date-fns';

import { dateFnsOptionsWithFirstWeekDate } from '../../0 - consts';
import calculateKDRatio from '../../0 - utils/calculateKDRatio';
import calculateScore from '../../0 - utils/calculateScore';
import { defaultWeekStatistics } from '../consts';
import { calculateDeaths } from './utils';

const addPlayerGameResultToWeekStatistics = (
  globalWeekStatistics: GlobalPlayerWeekStatistics[],
  playerGameResult: PlayerGameResult,
  date: Replay['date'],
): GlobalPlayerWeekStatistics[] => {
  const currentWeekStatistics = globalWeekStatistics.slice();

  const week = format(date, 'yyyy-ww', dateFnsOptionsWithFirstWeekDate) as GlobalPlayerWeekStatistics['week'];

  let currentStatisticsIndex = currentWeekStatistics.findIndex(
    (weekStatistics) => (weekStatistics.week === week),
  );

  if (currentStatisticsIndex === -1) {
    const newArrLength = currentWeekStatistics.push({
      week,
      ...defaultWeekStatistics,
    });

    currentStatisticsIndex = newArrLength - 1;
  }

  const weekStatistics = currentWeekStatistics[currentStatisticsIndex];

  const totalPlayedGames = weekStatistics.totalPlayedGames + 1;
  const kills = weekStatistics.kills + playerGameResult.kills;
  const vehicleKills = weekStatistics.vehicleKills + playerGameResult.vehicleKills;
  const teamkills = weekStatistics.teamkills + playerGameResult.teamkills;
  const currentDeaths: Deaths = {
    total: weekStatistics.deaths.total,
    byTeamkills: weekStatistics.deaths.byTeamkills,
  };

  const deaths = calculateDeaths({
    deaths: currentDeaths,
    isDead: playerGameResult.isDead,
    isDeadByTeamkill: playerGameResult.isDeadByTeamkill,
  });

  currentWeekStatistics[currentStatisticsIndex] = {
    ...currentWeekStatistics[currentStatisticsIndex],
    totalPlayedGames,
    kills,
    vehicleKills,
    teamkills,
    deaths,
    kdRatio: calculateKDRatio(kills, teamkills, deaths),
    score: calculateScore(totalPlayedGames, kills, teamkills, deaths),
  };

  return currentWeekStatistics;
};

export default addPlayerGameResultToWeekStatistics;
