import { format, startOfWeek } from 'date-fns';

import calculateKDRatio from '../../utils/calculateKDRatio';
import calculateScore from '../../utils/calculateScore';
import { defaultWeekStatistics } from '../consts';

const addPlayerGameResultToWeekStatistics = (
  globalWeekStatistics: GlobalPlayerWeekStatistics[],
  playerGameResult: PlayerGameResult,
  date: Replay['date'],
): GlobalPlayerWeekStatistics[] => {
  const currentWeekStatistics = globalWeekStatistics.slice();

  const parsedDate = new Date(date);
  const week = format(parsedDate, 'yyyy-ww', { weekStartsOn: 1 }) as GlobalPlayerWeekStatistics['week'];

  let currentStatisticsIndex = currentWeekStatistics.findIndex(
    (weekStatistics) => (weekStatistics.week === week),
  );

  if (currentStatisticsIndex === -1) {
    const newArrLength = currentWeekStatistics.push({
      week,
      date: startOfWeek(parsedDate, { weekStartsOn: 1 }),
      ...defaultWeekStatistics,
    });

    currentStatisticsIndex = newArrLength - 1;
  }

  const weekStatistics = currentWeekStatistics[currentStatisticsIndex];

  const totalPlayedGames = weekStatistics.totalPlayedGames + 1;
  const kills = weekStatistics.kills + playerGameResult.kills;
  const teamkills = weekStatistics.teamkills + playerGameResult.teamkills;
  const deaths = playerGameResult.isDead ? weekStatistics.deaths + 1 : weekStatistics.deaths;

  currentWeekStatistics[currentStatisticsIndex] = {
    ...currentWeekStatistics[currentStatisticsIndex],
    totalPlayedGames,
    kills,
    teamkills,
    deaths,
    kdRatio: calculateKDRatio(kills, deaths),
    score: calculateScore(totalPlayedGames, kills, teamkills),
  };

  return currentWeekStatistics;
};

export default addPlayerGameResultToWeekStatistics;
