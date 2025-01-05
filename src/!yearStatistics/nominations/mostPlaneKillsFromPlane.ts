import { keyBy } from 'lodash';

import { dayjsUTC } from '../../0 - utils/dayjs';
import getPlayerName from '../../0 - utils/getPlayerName';
import { getPlayerId } from '../../0 - utils/namesHelper/getId';
import getEntities from '../../2 - parseReplayInfo/getEntities';
import getPlayerNameAtEndOfTheYear from '../utils/getPlayerNameAtEndOfTheYear';
import limitAndOrder from '../utils/limitAndOrder';

export const sortMostPlaneKillsFromPlane = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostPlaneKillsFromPlane: limitAndOrder(
    statistics.mostPlaneKillsFromPlane,
    ['count', 'lastReplayDate', 'lastTime'],
    ['desc', 'asc', 'asc'],
  ),
});

const mostPlaneKillsFromPlane = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const nominees = keyBy<MostPlaneKillsFromPlane>(result.mostPlaneKillsFromPlane, 'id');

  const { players, vehicles } = getEntities(replayInfo);
  const vehiclesList = Object.values(vehicles);

  replayInfo.events.forEach((event) => {
    const eventType = event[1];

    if (eventType !== 'killed') return;

    const killedId = event[2];
    const killedVehicle = vehiclesList.find((vehicleItem) => vehicleItem.id === killedId);

    if (!killedVehicle || killedVehicle.class !== 'plane') return;

    const killInfo = event[3];

    if (killInfo[0] === 'null' || !killInfo[1]) return;

    const [killerId, killerWeaponName] = killInfo;

    const killer = players[killerId];

    if (!killer) return;

    const killerVehicle = Object.values(vehicles).find(
      (vehicleItem) => vehicleItem.name === killerWeaponName,
    );

    if (!killerVehicle || killerVehicle.class !== 'plane') return;

    const entityName = getPlayerName(killer.name)[0];
    const id = getPlayerId(entityName, dayjsUTC(other.replay.date));
    const name = getPlayerNameAtEndOfTheYear(id) ?? entityName;

    const emptyNominee: MostPlaneKillsFromPlane = {
      id,
      name,
      count: 0,
      lastReplayDate: dayjsUTC(other.replay.date).toJSON(),
      lastTime: event[0],
    };
    const currentNominee = nominees[id] || emptyNominee;

    nominees[id] = {
      id,
      name,
      count: currentNominee.count + 1,
      lastReplayDate: dayjsUTC(other.replay.date).toJSON(),
      lastTime: event[0],
    };
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostPlaneKillsFromPlane: Object.values(nominees),
    },
  };
};

export default mostPlaneKillsFromPlane;
