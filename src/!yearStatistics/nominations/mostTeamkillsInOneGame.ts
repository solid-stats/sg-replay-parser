import { orderBy } from 'lodash';

import { dayjsUTC } from '../../0 - utils/dayjs';
import getPlayerName from '../../0 - utils/getPlayerName';
import { getPlayerId } from '../../0 - utils/namesHelper/getId';
import getPlayerNameAtEndOfTheYear from '../utils/getPlayerNameAtEndOfTheYear';
import limitAndOrder from '../utils/limitAndOrder';
import { printFinish, printNominationProcessStart } from '../utils/printText';

const mostTeamkillsInOneGame = ({
  result,
  ...other
}: YearResultsInfo): YearResultsInfo => {
  printNominationProcessStart('most teamkills in one game');

  const list: NomineeList<MostTeamkillsInOneGame> = {};

  other.parsedReplays.forEach(({ result: playersResult, missionName, date }) => {
    const orderedResults = orderBy(playersResult, 'teamkills', 'desc');

    orderedResults.forEach(({ name: fullName, teamkills }) => {
      const entityName = getPlayerName(fullName)[0];
      const id = getPlayerId(entityName, dayjsUTC(date));
      const name = getPlayerNameAtEndOfTheYear(id) ?? entityName;

      const currentNominee: DefaultCountNomination = list[id] || {
        id, name, count: 0,
      };

      if (teamkills < currentNominee.count) return;

      const replayLink = other.replays.find(
        (replay) => replay.mission_name === missionName && replay.date === date,
      )?.replayLink;

      list[id] = {
        id,
        name,
        count: teamkills,
        link: replayLink ?? '-',
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
