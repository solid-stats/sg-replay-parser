import { keyBy, uniq } from 'lodash';

import { dayjsUTC } from '../../../shared/utils/dayjs';
import getPlayerName from '../../../shared/utils/getPlayerName';
import { getPlayerId } from '../../../shared/utils/namesHelper/getId';
import getEntities from '../../parsing/getEntities';
import getPlayerNameAtEndOfTheYear from '../utils/getPlayerNameAtEndOfTheYear';
import limitAndOrder from '../utils/limitAndOrder';

const uavs = ['darter', 'tayran', 'uav'];

export const sortMostAAKills = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostAAKills: {
    ...statistics.mostAAKills,
    nominations: limitAndOrder(statistics.mostAAKills.nominations, 'count', 'desc'),
  },
});

const mostAAKills = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const { players, vehicles } = getEntities(replayInfo);
  const vehiclesName = uniq(Object.values(vehicles).map((vehicle) => vehicle.name.toLowerCase()));

  const nomineesById = keyBy(result.mostAAKills.nominations, 'id') as NomineeList<DefaultCountNomination>;
  const destroyedVehicleNames = new Set(result.mostAAKills.destroyedVehicleNames);

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

      destroyedVehicleNames.add(killedVehicle.name);

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
      mostAAKills: {
        nominations: Object.values(nomineesById),
        destroyedVehicleNames,
      },
    },
  };
};

export default mostAAKills;
