import { keyBy } from 'lodash';

import getPlayerName from '../../0 - utils/getPlayerName';
import limitAndOrder from '../utils/limitAndOrder';

export const sortMostPopularMissionMaker = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostPopularMissionMaker: limitAndOrder(statistics.mostPopularMissionMaker, 'count', 'desc', 100000),
});

const mostPopularMissionMaker = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const nomineesByName = keyBy(result.mostPopularMissionMaker, 'name') as NomineeList<DefaultCountNomination>;
  const name = getPlayerName(replayInfo.missionAuthor)[0];

  const nominee = nomineesByName[name];

  nomineesByName[name] = { name, count: (nominee?.count || 0) + 1 };

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostPopularMissionMaker: Object.values(nomineesByName),
    },
  };
};

export default mostPopularMissionMaker;
