import { Dayjs } from 'dayjs';
import { orderBy } from 'lodash';

import { dayjsUTC } from '../../../shared/utils/dayjs';
import { isInInterval } from '../../../shared/utils/isInInterval';
import pipe from '../../../shared/utils/pipe';
import { playerStatsSort } from '../consts';
import getSquadsInfo from './getSquadInfo';

const sortStatistics = (stats: GlobalSquadStatistics[]) => (
  orderBy(stats, ['score', 'averagePlayersCount', 'averageKills'], ['desc', 'desc', 'desc']).map((squadStats) => ({
    ...squadStats,
    players: orderBy(squadStats.players, ...playerStatsSort),
  }))
);

const filterStatistics = (stats: GlobalSquadStatistics[]) => (
  stats.filter((squad) => squad.players.length > 4)
);

const calculateSquadStatistics = (
  replays: PlayersGameResult[],
  rotationStartDate: Dayjs,
  rotationLastDate: Dayjs | null,
  only4Weeks: boolean,
): GlobalSquadStatistics[] => {
  if (!replays.length) return [];

  let currentDate = dayjsUTC();
  let rotationEndDate = rotationLastDate ?? undefined;

  const lastReplayDate = dayjsUTC(replays[replays.length - 1].date);

  const isLastReplayOnThisDay = lastReplayDate.isoWeek() === currentDate.isoWeek()
    && lastReplayDate.weekday() === currentDate.weekday();

  if (!isLastReplayOnThisDay) {
    currentDate = currentDate.startOf('day');
    rotationEndDate = rotationEndDate?.startOf('day');
  }

  const endDate = rotationEndDate || currentDate;
  let fourWeeksIntervalStartDate = endDate.subtract(4, 'weeks');

  if (rotationStartDate.isAfter(fourWeeksIntervalStartDate)) {
    fourWeeksIntervalStartDate = rotationStartDate;
  }

  const replaysForCalculations = replays.filter((replay) => (
    isInInterval(
      dayjsUTC(replay.date),
      only4Weeks
        ? fourWeeksIntervalStartDate
        : rotationStartDate,
      endDate,
    )
  ));

  const squadsInfo = getSquadsInfo(replaysForCalculations);

  return pipe(sortStatistics, filterStatistics)(squadsInfo);
};

export default calculateSquadStatistics;
