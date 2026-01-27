/* eslint-disable no-continue */
import { groupBy, keyBy, uniqBy } from 'lodash';

import { dayjsUTC } from '../../../shared/utils/dayjs';
import getPlayerName from '../../../shared/utils/getPlayerName';
import { getPlayerId } from '../../../shared/utils/namesHelper/getId';
import getPlayerNameAtEndOfTheYear from '../utils/getPlayerNameAtEndOfTheYear';
import limitAndOrder from '../utils/limitAndOrder';

export const sortMostDisconnects = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostDisconnects: limitAndOrder(
    statistics.mostDisconnects,
    ['count', 'gamesWithAtLeastOneDisconnect'],
    ['desc', 'desc'],
  ),
});

const mostDisconnects = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const nomineesById = keyBy(result.mostDisconnects, 'id') as NomineeList<MostDisconnects>;
  const alreadyConnectedOnce = new Set<PlayerId>();

  const connectEvents = replayInfo.events.filter((event) => {
    const eventType = event[1];

    return eventType === 'disconnected' || eventType === 'connected';
  }) as ConnectEvent[];

  // group events by player name
  // -> remove duplicate by frame id events in each group
  // -> remove elements where there was only disconnects or one connect
  const eventsGroupedByPlayer = Object.values(groupBy(connectEvents, (event) => event[2]))
    .map((events) => uniqBy(events, (event) => `${event[0]}-${event[1]}`))
    .map((events) => events.sort((first, second) => first[0] - second[0]))
    .filter((events) => events.length > 1);

  eventsGroupedByPlayer.forEach((events) => {
    for (let index = 1; index < events.length; index += 1) {
      const prevEvent = events[index - 1];
      const event = events[index];

      if (event[1] !== 'connected' || prevEvent[1] !== 'disconnected') continue;

      const [frameId, , playerName, entityId] = event;
      const entity = replayInfo.entities[entityId];

      if (!entity || entity.type !== 'unit') continue;

      const unitPositionAtConnect = entity.positions?.[frameId];
      const isUnitDead = unitPositionAtConnect?.[2] === 0;

      if (isUnitDead) continue;

      const entityName = getPlayerName(playerName)[0];
      const id = getPlayerId(entityName, dayjsUTC(other.replay.date));
      const name = getPlayerNameAtEndOfTheYear(id) ?? entityName;

      const isAlreadyConnected = alreadyConnectedOnce.has(id);

      if (!isAlreadyConnected) alreadyConnectedOnce.add(id);

      const nominee = nomineesById[id] || {
        id, name, count: 0, gamesWithAtLeastOneDisconnect: 0,
      };

      nomineesById[id] = {
        ...nominee,
        count: nominee.count + 1,
        gamesWithAtLeastOneDisconnect: isAlreadyConnected
          ? nominee.gamesWithAtLeastOneDisconnect
          : nominee.gamesWithAtLeastOneDisconnect + 1,
      };
    }
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostDisconnects: Object.values(nomineesById),
    },
  };
};

export default mostDisconnects;
