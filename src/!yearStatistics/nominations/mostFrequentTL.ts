import { groupBy, keyBy } from 'lodash';

import { dayjsUTC } from '../../0 - utils/dayjs';
import getPlayerName from '../../0 - utils/getPlayerName';
import { getPlayerId } from '../../0 - utils/namesHelper/getId';
import getEntities from '../../2 - parseReplayInfo/getEntities';
import getPlayerNameAtEndOfTheYear from '../utils/getPlayerNameAtEndOfTheYear';
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
  const nomineesById = keyBy(result.mostFrequentTL, 'id') as NomineeList<DefaultCountNomination>;
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

      const currentNominee = nomineesById[id] || { id, name, count: 0 };

      nomineesById[id] = {
        id,
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
      mostFrequentTL: Object.values(nomineesById),
    },
  };
};

export default mostFrequentTL;
