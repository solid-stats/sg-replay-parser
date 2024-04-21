import { Dayjs } from 'dayjs';
import { orderBy } from 'lodash';

import { dayjsUTC } from '../../0 - utils/dayjs';
import { isInInterval } from '../../0 - utils/isInInterval';
import pipe from '../../0 - utils/pipe';
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
  // not used in calculations for global statistics
  rotationLastDate?: Dayjs | null,
  rotationStartDate?: Dayjs,
): GlobalSquadStatistics[] => {
  if (!replays.length) return [];

  let currentDate = dayjsUTC('2024-01-01').endOf('day');
  let rotationEndDate = rotationLastDate;
  const lastReplayDate = dayjsUTC(replays[replays.length - 1].date);
  const isLastReplayOnThisDay = lastReplayDate.isoWeek() === currentDate.isoWeek()
    && lastReplayDate.weekday() === currentDate.weekday();

  if (!isLastReplayOnThisDay) {
    currentDate = currentDate.startOf('day');
    rotationEndDate = rotationEndDate?.startOf('day');
  }

  const endDate = rotationEndDate || currentDate;

  const replaysForCalculations = replays.filter((replay) => (
    isInInterval(
      dayjsUTC(replay.date),
      rotationStartDate ?? endDate.subtract(4, 'weeks'),
      endDate,
    )
  ));

  const squadsInfo = getSquadsInfo(replaysForCalculations);

  return pipe(sortStatistics, filterStatistics)(squadsInfo);
};

export default calculateSquadStatistics;
