import { orderBy } from 'lodash';

import { dayjsUTC } from '../../../shared/utils/dayjs';
import getPlayerName from '../../../shared/utils/getPlayerName';
import { getPlayerId } from '../../../shared/utils/namesHelper/getId';
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

      const playerStats = other.globalStatistics.find((stat) => stat.id === id);

      if (!playerStats) return;

      list[id] = {
        id,
        name,
        count: teamkills,
        link: replayLink ?? '-',
        totalTeamkills: playerStats.teamkills,
      };
    });
  });

  printFinish();

  return {
    ...other,
    result: {
      ...result,
      mostTeamkillsInOneGame: limitAndOrder(list, ['count', 'totalTeamkills'], ['desc', 'asc']),
    },
  };
};

export default mostTeamkillsInOneGame;
