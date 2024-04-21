import { orderBy, take } from 'lodash';

import { printFinish, printNominationProcessStart } from '../utils/printText';

const mostDeathsFromTeamkills = ({
  result,
  ...other
}: YearResultsInfo): YearResultsInfo => {
  printNominationProcessStart('most deaths from teamkills');

  const list = other.globalStatistics.map(
    ({
      id,
      name,
      deaths: { byTeamkills },
      totalPlayedGames,
    }) => ({
      id,
      name,
      count: byTeamkills,
      totalPlayedGames,
    }),
  );
  const orderedList = orderBy(list, ['count', 'totalPlayedGames'], ['desc', 'desc']);

  const nomineeList: DefaultCountNomination[] = orderedList.map(
    ({ totalPlayedGames, ...otherStats }) => otherStats,
  );

  printFinish();

  return {
    ...other,
    result: {
      ...result,
      mostDeathsFromTeamkills: take(nomineeList, 10),
    },
  };
};

export default mostDeathsFromTeamkills;
