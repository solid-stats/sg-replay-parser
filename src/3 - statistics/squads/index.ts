import { Dayjs } from 'dayjs';
import { orderBy } from 'lodash';

import { dayjsUTC } from '../../0 - utils/dayjs';
import pipe from '../../0 - utils/pipe';
import { playerStatsSort } from '../consts';
import getSquadsInfo from './getSquadInfo';
import { isInInterval } from './utils/funcs';
import { DayjsInterval } from './utils/types';

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
  rotationLastDate: Dayjs | null,
): GlobalSquadStatistics[] => {
  if (!replays.length) return [];

  let currentDate = dayjsUTC();
  let rotationEndDate = rotationLastDate;
  const lastReplayDate = dayjsUTC(replays[replays.length - 1].date);
  const isLastReplayOnThisDay = lastReplayDate.isoWeek() === currentDate.isoWeek()
    && lastReplayDate.weekday() === currentDate.weekday();

  if (!isLastReplayOnThisDay) {
    currentDate = currentDate.startOf('day');
    rotationEndDate = rotationEndDate?.startOf('day') || null;
  }

  const endDate = rotationEndDate || currentDate;

  const last4WeeksInterval: DayjsInterval = [
    endDate.subtract(4, 'weeks'),
    endDate,
  ];

  const replaysForTheLast4Weeks = replays.filter((replay) => (
    isInInterval(replay.date, last4WeeksInterval)
  ));

  const squadsInfo = getSquadsInfo(replaysForTheLast4Weeks);

  return pipe(sortStatistics, filterStatistics)(squadsInfo);
};

export default calculateSquadStatistics;
