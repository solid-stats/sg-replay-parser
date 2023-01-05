import { orderBy, take } from 'lodash';

import { maxRecords } from '../utils/consts';
import { printFinish, printNominationProcessStart } from '../utils/printText';

const mostTeamkills = ({
  result,
  ...other
}: YearResultsInfo): YearResultsInfo => {
  printNominationProcessStart('most teamkills');

  const orderedStatistics = orderBy(other.globalStatistics, ['teamkills', 'totalPlayedGames'], ['desc', 'desc']);
  const nomineeList: DefaultCountNomination[] = take(
    orderedStatistics,
    maxRecords,
  ).map(({ name, teamkills }) => ({
    name,
    count: teamkills,
  }));

  printFinish();

  return {
    ...other,
    result: {
      ...result,
      mostTeamkills: nomineeList,
    },
  };
};

export default mostTeamkills;
