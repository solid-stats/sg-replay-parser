import { keyBy } from 'lodash';

import getPlayerName from '../../0 - utils/getPlayerName';
import getEntities from '../../2 - parseReplayInfo/getEntities';
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
  const nomineesByName = keyBy(result.mostShots, 'name') as NomineeList<MostShots>;
  const entities = getEntities(replayInfo).players;

  replayInfo.entities.forEach((entity) => {
    const playerInfo = entities[entity.id];

    if (!playerInfo) return;

    const name = getPlayerName(playerInfo.name)[0];
    const currentNominee = nomineesByName[name] || {
      name, count: 0, gamesCountWithAtleastOneShot: 0,
    };
    const shotsCount = entity.framesFired.length;

    nomineesByName[name] = {
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
      mostShots: Object.values(nomineesByName),
    },
  };
};

export default mostShots;
