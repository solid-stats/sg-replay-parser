import { orderBy } from 'lodash';

import { dayjsUTC } from '../../../shared/utils/dayjs';
import limitAndOrder from '../utils/limitAndOrder';
import { printFinish, printNominationProcessStart } from '../utils/printText';

// eslint-disable-next-line no-useless-escape
const regex = /(?<=sg\@\d\d\d\_)(.*?)(?=\_v\d)/gm;

export const processMissionDates = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostPopularMission: statistics.mostPopularMission.map((nominee) => ({
    ...nominee,
    lastPlayedDate: dayjsUTC(nominee.lastPlayedDate).format('DD.MM.YYYY'),
  })),
});

// sg@216_suppression_v4 -> suppression
// sg@216_abu_Лалезар_v4 -> abu_Лалезар
// sg@215_lem_teamwork_v10 -> lem_teamwork
// sg@217_ney_unwelcome_broadcast_v8fix - ney_unwelcome_broadcast
const extractMissionName = (missionName: Replay['mission_name']) => (missionName.replace(' ', '_').match(regex) || [])[0];

const mostPopularMission = ({
  result,
  replays,
  ...other
}: YearResultsInfo): YearResultsInfo => {
  printNominationProcessStart('best mission');

  const list: NomineeList<BestMission> = {};

  const orderedReplays = orderBy(replays, 'date', 'asc');

  orderedReplays.forEach(({ mission_name, date, world_name: map }) => {
    const name = extractMissionName(mission_name);

    if (!name || name === 'retreat') return;

    const currentReplayInfo = list[name];

    if (!currentReplayInfo) {
      list[name] = {
        id: name,
        name,
        lastPlayedDate: date,
        map,
        count: 1,
      };

      return;
    }

    list[name] = {
      id: name,
      name,
      count: currentReplayInfo.count + 1,
      lastPlayedDate: date,
      map,
    };
  });

  printFinish();

  return {
    ...other,
    replays,
    result: {
      ...result,
      mostPopularMission: limitAndOrder(list, ['count', 'lastPlayedDate'], ['desc', 'desc']),
    },
  };
};

export default mostPopularMission;
