import { groupBy, keyBy } from 'lodash';

import { dayjsUTC } from '../../../shared/utils/dayjs';
import getPlayerName from '../../../shared/utils/getPlayerName';
import { getPlayerId } from '../../../shared/utils/namesHelper/getId';
import getEntities from '../../parsing/getEntities';
import getPlayerNameAtEndOfTheYear from '../utils/getPlayerNameAtEndOfTheYear';
import limitAndOrder from '../utils/limitAndOrder';

export const sortMostFrequentTL = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostFrequentTL: limitAndOrder(statistics.mostFrequentTL, ['count', 'totalPlayedGames'], ['desc', 'asc']),
});

const mostFrequentTL = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const nomineesById = keyBy(result.mostFrequentTL, 'id') as NomineeList<MostFrequentCommander>;
  const { players } = getEntities(replayInfo);

  const groupedBySide = groupBy(
    replayInfo.entities.filter((entity) => entity.type === 'unit'),
    'side',
  ) as Record<EntitySide, PlayerEntity[]>;
  const groupedBySideAndGroup = Object.values(groupedBySide)
    .map((side) => groupBy(side, 'group')) as Array<Record<PlayerEntity['group'], PlayerEntity[]>>;

  groupedBySideAndGroup.forEach((entitiesByGroup) => {
    const groups = Object.values(entitiesByGroup);
    const teamleaders = groups
      .map((group) => group[0])
      .filter((teamleader) => players[teamleader.id]);

    teamleaders.forEach((teamleader) => {
      const entityName = getPlayerName(teamleader.name)[0];
      const id = getPlayerId(entityName, dayjsUTC(other.replay.date));
      const name = getPlayerNameAtEndOfTheYear(id) ?? entityName;

      const playerGlobalStats = other.globalStatistics.find((stat) => stat.id === id);

      if (!playerGlobalStats) return;

      const currentNominee: MostFrequentCommander = nomineesById[id] || {
        id,
        name,
        count: 0,
        totalPlayedGames: playerGlobalStats.totalPlayedGames,
      };

      nomineesById[id] = {
        id,
        name,
        count: currentNominee.count + 1,
        totalPlayedGames: playerGlobalStats.totalPlayedGames,
      };
    });
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostFrequentTL: Object.values(nomineesById),
    },
  };
};

export default mostFrequentTL;
