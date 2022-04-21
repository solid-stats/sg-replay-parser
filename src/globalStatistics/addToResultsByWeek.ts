import { format } from 'date-fns';

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

  currentWeekStatistics[currentStatisticsIndex] = {
    ...currentWeekStatistics[currentStatisticsIndex],
    kills: weekStatistics.kills + playerGameResult.kills,
    teamkills: weekStatistics.teamkills + playerGameResult.teamkills,
    deaths: playerGameResult.isDead ? weekStatistics.deaths + 1 : weekStatistics.deaths,
  };

  return currentWeekStatistics;
};

export default addPlayerGameResultToWeekStatistics;
