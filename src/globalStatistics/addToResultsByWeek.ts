import { format } from 'date-fns';

import calculateScore from '../utils/calculateScore';
import { defaultWeekStatistics } from './consts';

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
      ...defaultWeekStatistics,
    });

    currentStatisticsIndex = newArrLength - 1;
  }

  const weekStatistics = currentWeekStatistics[currentStatisticsIndex];

  const totalPlayedGames = weekStatistics.totalPlayedGames + 1;
  const kills = weekStatistics.kills + playerGameResult.kills;
  const teamkills = weekStatistics.teamkills + playerGameResult.teamkills;

  currentWeekStatistics[currentStatisticsIndex] = {
    ...currentWeekStatistics[currentStatisticsIndex],
    totalPlayedGames,
    kills,
    teamkills,
    deaths: playerGameResult.isDead ? weekStatistics.deaths + 1 : weekStatistics.deaths,
    score: calculateScore(totalPlayedGames, kills, teamkills),
  };

  return currentWeekStatistics;
};

export default addPlayerGameResultToWeekStatistics;
