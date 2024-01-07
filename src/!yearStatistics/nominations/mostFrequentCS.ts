import { groupBy, keyBy } from 'lodash';

import { dayjsUTC } from '../../0 - utils/dayjs';
import getPlayerName from '../../0 - utils/getPlayerName';
import { getPlayerId } from '../../0 - utils/namesHelper/getId';
import getEntities from '../../2 - parseReplayInfo/getEntities';
import getPlayerNameAtEndOfTheYear from '../utils/getPlayerNameAtEndOfTheYear';
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
  const nomineesById = keyBy(result.mostFrequentCS, 'id') as NomineeList<DefaultCountNomination>;
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

    const currentNominee = nomineesById[id] || { id, name, count: 0 };

    nomineesById[id] = {
      id,
      name,
      count: currentNominee.count + 1,
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
