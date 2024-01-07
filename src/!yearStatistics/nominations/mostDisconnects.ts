import {
  flatten, groupBy, keyBy, uniqBy,
} from 'lodash';

import { dayjsUTC } from '../../0 - utils/dayjs';
import getPlayerName from '../../0 - utils/getPlayerName';
import { getPlayerId } from '../../0 - utils/namesHelper/getId';
import getPlayerNameAtEndOfTheYear from '../utils/getPlayerNameAtEndOfTheYear';
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
  const nomineesById = keyBy(result.mostDisconnects, 'id') as NomineeList<MostDisconnects>;
  const alreadyConnectedOnce: PlayerId[] = [];

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

    const entityName = getPlayerName(playerName)[0];
    const id = getPlayerId(entityName, dayjsUTC(other.replay.date));
    const name = getPlayerNameAtEndOfTheYear(id) ?? entityName;

    const unitPositionAtConnect = replayInfo.entities[entityId].positions[frameId];
    const isUnitDead = unitPositionAtConnect && unitPositionAtConnect[2] === 0;

    if (isUnitDead) return;

    const isAlreadyConnectedOnce = alreadyConnectedOnce.includes(id);

    if (!isAlreadyConnectedOnce) alreadyConnectedOnce.push(id);

    const nominee = nomineesById[id] || {
      id, name, count: 0, gamesWithAtleastOneDisconnect: 0,
    };

    nomineesById[id] = {
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
      mostDisconnects: Object.values(nomineesById),
    },
  };
};

export default mostDisconnects;
