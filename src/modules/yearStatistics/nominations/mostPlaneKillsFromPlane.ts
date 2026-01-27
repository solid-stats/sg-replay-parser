import { keyBy } from 'lodash';

import { dayjsUTC } from '../../../shared/utils/dayjs';
import getPlayerName from '../../../shared/utils/getPlayerName';
import { getPlayerId } from '../../../shared/utils/namesHelper/getId';
import getEntities from '../../parsing/getEntities';
import getPlayerNameAtEndOfTheYear from '../utils/getPlayerNameAtEndOfTheYear';
import limitAndOrder from '../utils/limitAndOrder';

export const sortMostPlaneKillsFromPlane = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostPlaneKillsFromPlane: limitAndOrder(
    statistics.mostPlaneKillsFromPlane,
    ['count', 'totalVehiclesDestroyed', 'totalKills'],
    ['desc', 'desc', 'desc'],
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

    const playerGlobalStats = other.globalStatistics.find(
      (stat) => stat.id === id,
    );

    if (!playerGlobalStats) return;

    const emptyNominee: MostPlaneKillsFromPlane = {
      id,
      name,
      count: 0,
      totalKills: 0,
      totalVehiclesDestroyed: 0,
    };
    const currentNominee = nominees[id] || emptyNominee;

    nominees[id] = {
      id,
      name,
      count: currentNominee.count + 1,
      totalKills: playerGlobalStats.kills,
      totalVehiclesDestroyed: playerGlobalStats.vehicleKills,
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
