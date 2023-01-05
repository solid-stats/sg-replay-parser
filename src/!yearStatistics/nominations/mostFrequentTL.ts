import { groupBy, keyBy } from 'lodash';

import getPlayerName from '../../0 - utils/getPlayerName';
import getEntities from '../../2 - parseReplayInfo/getEntities';
import limitAndOrder from '../utils/limitAndOrder';

export const sortMostFrequentTL = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostFrequentTL: limitAndOrder(statistics.mostFrequentTL, 'count', 'desc'),
});

const mostFrequentTL = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const nomineesByName = keyBy(result.mostFrequentTL, 'name') as NomineeList<DefaultCountNomination>;
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
      const name = getPlayerName(teamleader.name)[0];
      const currentNominee = nomineesByName[name] || { name, count: 0 };

      nomineesByName[name] = {
        name,
        count: currentNominee.count + 1,
      };
    });
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostFrequentTL: Object.values(nomineesByName),
    },
  };
};

export default mostFrequentTL;
