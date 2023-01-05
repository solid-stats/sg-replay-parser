import { groupBy, keyBy } from 'lodash';

import getPlayerName from '../../0 - utils/getPlayerName';
import getEntities from '../../2 - parseReplayInfo/getEntities';
import limitAndOrder from '../utils/limitAndOrder';

export const sortMostFrequentCS = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostFrequentCS: limitAndOrder(statistics.mostFrequentCS, 'count', 'desc'),
});

const mostFrequentCS = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const nomineesByName = keyBy(result.mostFrequentCS, 'name') as NomineeList<DefaultCountNomination>;
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

    const name = getPlayerName(sideCommander.name)[0];
    const currentNominee = nomineesByName[name] || { name, count: 0 };

    nomineesByName[name] = {
      name,
      count: currentNominee.count + 1,
    };
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostFrequentCS: Object.values(nomineesByName),
    },
  };
};

export default mostFrequentCS;
