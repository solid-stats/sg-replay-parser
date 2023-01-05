import { orderBy } from 'lodash';

import getPlayerName from '../../0 - utils/getPlayerName';
import limitAndOrder from '../utils/limitAndOrder';
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

  return {
    ...other,
    result: {
      ...result,
      mostTeamkillsInOneGame: limitAndOrder(list, ['count', 'missionName'], ['desc', 'desc']),
    },
  };
};

export default mostTeamkillsInOneGame;
