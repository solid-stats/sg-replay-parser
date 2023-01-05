import { maxBy, orderBy } from 'lodash';

import getPlayerName from '../../0 - utils/getPlayerName';
import { printFinish, printNominationProcessStart } from '../utils/printText';

const mostTeamkillsInOneGame = ({
  result,
  ...other
}: YearResultsInfo): YearResultsInfo => {
  printNominationProcessStart('most teamkills in one game');

  const list: NomineeList<MostTeamkillsInOneGame> = {};

  other.parsedReplays.forEach(({ result: playersResult, missionName }) => {
    const orderedResults = orderBy(playersResult, 'teamkills', 'desc');
    const maxTeamkills = orderedResults[0].teamkills;

    if (maxTeamkills === 0) return;

    orderedResults.forEach(({ name: fullName, teamkills }) => {
      if (teamkills < maxTeamkills) return;

      const name = getPlayerName(fullName)[0];
      const count = teamkills;

      list[name] = {
        name,
        count,
        missionName,
      };
    });
  });

  printFinish();

  const maximumTeamkills = maxBy(Object.values(list), 'count')?.count || 0;
  const filteredList = Object.values(list).filter(
    (teamkiller) => teamkiller.count > (15 * maximumTeamkills) / 100,
  );

  return {
    ...other,
    result: {
      ...result,
      mostTeamkillsInOneGame: orderBy(filteredList, ['count', 'missionName'], ['desc', 'desc']),
    },
  };
};

export default mostTeamkillsInOneGame;
