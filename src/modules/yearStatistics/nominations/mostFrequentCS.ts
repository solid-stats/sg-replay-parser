import { groupBy, keyBy } from 'lodash';

import { dayjsUTC } from '../../../shared/utils/dayjs';
import getPlayerName from '../../../shared/utils/getPlayerName';
import { getPlayerId } from '../../../shared/utils/namesHelper/getId';
import getEntities from '../../parsing/getEntities';
import getPlayerNameAtEndOfTheYear from '../utils/getPlayerNameAtEndOfTheYear';
import limitAndOrder from '../utils/limitAndOrder';

export const sortMostFrequentCS = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostFrequentCS: limitAndOrder(statistics.mostFrequentCS, ['count', 'totalPlayedGames'], ['desc', 'asc']),
});

const mostFrequentCS = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const nomineesById = keyBy(result.mostFrequentCS, 'id') as NomineeList<MostFrequentCommander>;
  const { players } = getEntities(replayInfo);

  const groupedBySide = groupBy(
    replayInfo.entities.filter((entity) => entity.type === 'unit'),
    'side',
  ) as Record<EntitySide, PlayerEntity[]>;
  const groupedBySideAndGroup = Object.values(groupedBySide)
    .map((side) => groupBy(side, 'group')) as Array<Record<PlayerEntity['group'], PlayerEntity[]>>;

  groupedBySideAndGroup.forEach((entitiesByGroup) => {
    const sideCommander = Object.values(entitiesByGroup)[0][0];

    if (!players[sideCommander.id]) return;

    const entityName = getPlayerName(sideCommander.name)[0];
    const id = getPlayerId(entityName, dayjsUTC(other.replay.date));
    const name = getPlayerNameAtEndOfTheYear(id) ?? entityName;

    const playerGlobalStats = other.globalStatistics.find((stat) => stat.id === id);

    if (!playerGlobalStats) return;

    const currentNominee: MostFrequentCommander = nomineesById[id] || {
      id,
      name,
      count: 0,
      totalPlayedGames: 0,
    };

    nomineesById[id] = {
      id,
      name,
      count: currentNominee.count + 1,
      totalPlayedGames: playerGlobalStats.totalPlayedGames,
    };
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostFrequentCS: Object.values(nomineesById),
    },
  };
};

export default mostFrequentCS;
