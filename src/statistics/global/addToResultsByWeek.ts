import { format } from 'date-fns';

import { dateFnsOptions, dateFnsOptionsWithFirstWeekDate } from '../../consts';
import calculateKDRatio from '../../utils/calculateKDRatio';
import calculateScore from '../../utils/calculateScore';
import { defaultWeekStatistics } from '../consts';

const addPlayerGameResultToWeekStatistics = (
  globalWeekStatistics: GlobalPlayerWeekStatistics[],
  playerGameResult: PlayerGameResult,
  date: Replay['date'],
): GlobalPlayerWeekStatistics[] => {
  const currentWeekStatistics = globalWeekStatistics.slice();

  const week = format(date, 'yyyy-ww', dateFnsOptionsWithFirstWeekDate) as GlobalPlayerWeekStatistics['week'];

  // if (week === '2020-45') {
  //   console.log(date, week, format(date, 'yyyy-ww', dateFnsOptions));
  // }

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
