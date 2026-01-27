import { keyBy } from 'lodash';

import { dayjsUTC } from '../../../shared/utils/dayjs';
import getPlayerName from '../../../shared/utils/getPlayerName';
import { getPlayerId } from '../../../shared/utils/namesHelper/getId';
import getEntities from '../../parsing/getEntities';
import getPlayerNameAtEndOfTheYear from '../utils/getPlayerNameAtEndOfTheYear';
import limitAndOrder from '../utils/limitAndOrder';

// Shows shots only from firearms, does not work with shots from vehicle

export const sortMostShots = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostShots: limitAndOrder(statistics.mostShots, 'count', 'desc'),
});

const mostShots = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const nomineesById = keyBy(result.mostShots, 'id') as NomineeList<MostShots>;
  const entities = getEntities(replayInfo).players;

  replayInfo.entities.forEach((entity) => {
    const playerInfo = entities[entity.id];

    if (!playerInfo) return;

    const entityName = getPlayerName(playerInfo.name)[0];
    const id = getPlayerId(entityName, dayjsUTC(other.replay.date));
    const name = getPlayerNameAtEndOfTheYear(id) ?? entityName;

    const currentNominee = nomineesById[id] || {
      id, name, count: 0, gamesCountWithAtleastOneShot: 0,
    };
    const shotsCount = entity.framesFired.length;

    nomineesById[id] = {
      id,
      name,
      count: currentNominee.count + shotsCount,
      gamesCountWithAtleastOneShot: shotsCount > 0
        ? currentNominee.gamesCountWithAtleastOneShot + 1
        : currentNominee.gamesCountWithAtleastOneShot,
    };
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostShots: Object.values(nomineesById),
    },
  };
};

export default mostShots;
