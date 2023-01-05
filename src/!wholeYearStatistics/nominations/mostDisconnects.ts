import {
  flatten, groupBy, keyBy, uniqBy,
} from 'lodash';

import getPlayerName from '../../0 - utils/getPlayerName';
import limitAndOrder from '../utils/limitAndOrder';

export const sortMostDisconnects = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostDisconnects: limitAndOrder(
    statistics.mostDisconnects,
    ['count', 'gamesWithAtleastOneDisconnect'],
    ['desc', 'desc'],
  ),
});

const mostDisconnects = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const nomineesByName = keyBy(result.mostDisconnects, 'name') as NomineeList<MostDisconnects>;
  const alreadyConnectedOnce: PlayerName[] = [];

  const connectEvents = replayInfo.events.filter((event) => {
    const eventType = event[1];

    return eventType === 'disconnected' || eventType === 'connected';
  }) as ConnectEvent[];

  // group events by player name
  // -> remove duplicate by frame id events in each group
  // -> remove elements where there was only disconnects or one connect
  const eventsGroupedByPlayer = Object.values(groupBy(connectEvents, (event) => event[2]))
    .map((events) => uniqBy(events, (event) => event[0]))
    .filter((events) => events.length > 1);

  const flatEvents = flatten(eventsGroupedByPlayer);

  flatEvents.forEach((event, index) => {
    const prevEvent = flatEvents[index - 1];

    if (
      event[1] === 'disconnected'
      || !prevEvent
      || (event[1] === 'connected' && prevEvent[1] !== 'disconnected')
    ) return;

    const [frameId, , playerName, entityId] = event;

    const name = getPlayerName(playerName)[0];

    const unitPositionAtConnect = replayInfo.entities[entityId].positions[frameId];
    const isUnitDead = unitPositionAtConnect && unitPositionAtConnect[2] === 0;

    if (isUnitDead) return;

    const isAlreadyConnectedOnce = alreadyConnectedOnce.includes(name);

    if (!isAlreadyConnectedOnce) alreadyConnectedOnce.push(name);

    const nominee = nomineesByName[name] || { name, count: 0, gamesWithAtleastOneDisconnect: 0 };

    nomineesByName[name] = {
      ...nominee,
      count: nominee.count + 1,
      gamesWithAtleastOneDisconnect: isAlreadyConnectedOnce
        ? nominee.gamesWithAtleastOneDisconnect
        : nominee.gamesWithAtleastOneDisconnect + 1,
    };
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostDisconnects: Object.values(nomineesByName),
    },
  };
};

export default mostDisconnects;
