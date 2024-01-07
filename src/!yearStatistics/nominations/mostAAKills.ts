import { keyBy, uniq } from 'lodash';

import { dayjsUTC } from '../../0 - utils/dayjs';
import getPlayerName from '../../0 - utils/getPlayerName';
import { getPlayerId } from '../../0 - utils/namesHelper/getId';
import { forbiddenWeapons } from '../../0 - utils/weaponsStatistic';
import getEntities from '../../2 - parseReplayInfo/getEntities';
import getPlayerNameAtEndOfTheYear from '../utils/getPlayerNameAtEndOfTheYear';
import limitAndOrder from '../utils/limitAndOrder';

const uavs = ['darter', 'tayran', 'uav'];

export const sortMostAAKills = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostAAKills: limitAndOrder(statistics.mostAAKills, 'count', 'desc'),
});

const mostAAKills = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const nomineesById = keyBy(result.mostAAKills, 'id') as NomineeList<DefaultCountNomination>;
  const { players, vehicles } = getEntities(replayInfo);
  const vehiclesName = uniq(Object.values(vehicles).map((vehicle) => vehicle.name.toLowerCase()));

  replayInfo.events.forEach((event) => {
    const eventType = event[1];

    if (eventType !== 'killed') return;

    // eslint-disable-next-line array-element-newline
    const [killFrame, , killedId, killInfo] = event;

    if (killInfo[0] === 'null' || !killInfo[1]) return;

    const [killerId, weaponName] = killInfo;
    const loweredWeaponName = weaponName.toLowerCase();

    const killer = players[killerId];
    const killedPlayer = players[killedId];
    const killedVehicle = vehicles[killedId];

    if (
      !killer
      || killedPlayer
      || !killedVehicle
      || forbiddenWeapons.includes(loweredWeaponName)
      || vehiclesName.includes(loweredWeaponName)
    ) return;

    if (killedVehicle.class === 'heli' || killedVehicle.class === 'plane') {
      const vehiclePositionAtDestroy = replayInfo
        .entities[killedVehicle.id]
        .positions[killFrame];
      const positionTwoFramesBeforeDestroy = replayInfo
        .entities[killedVehicle.id]
        .positions[killFrame - 2];

      if (!vehiclePositionAtDestroy || !positionTwoFramesBeforeDestroy) return;

      const isLanded = vehiclePositionAtDestroy[2] <= 0;
      const isWasFlying = positionTwoFramesBeforeDestroy[2] > 0;

      if (isLanded && !isWasFlying) return;

      const entityName = getPlayerName(killer.name)[0];
      const id = getPlayerId(entityName, dayjsUTC(other.replay.date));
      const name = getPlayerNameAtEndOfTheYear(id) ?? entityName;

      if (uavs.some((uav) => killedVehicle.name.toLowerCase().includes(uav))) return;

      const currentNominee: DefaultCountNomination = nomineesById[id] || {
        id, name, count: 0,
      };

      nomineesById[id] = {
        id,
        name,
        count: currentNominee.count + 1,
      };
    }
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostAAKills: Object.values(nomineesById),
    },
  };
};

export default mostAAKills;
