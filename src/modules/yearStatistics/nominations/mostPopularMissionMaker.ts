import { keyBy } from 'lodash';

import getPlayerName from '../../../shared/utils/getPlayerName';
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
  const nomineesById = keyBy(result.mostPopularMissionMaker, 'id') as NomineeList<DefaultCountNomination>;
  const name = getPlayerName(replayInfo.missionAuthor)[0];
  const id = name;

  const nominee = nomineesById[name];

  nomineesById[id] = { id, name, count: (nominee?.count || 0) + 1 };

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostPopularMissionMaker: Object.values(nomineesById),
    },
  };
};

export default mostPopularMissionMaker;
