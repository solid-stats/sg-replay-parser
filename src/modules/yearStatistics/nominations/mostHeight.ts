import { keyBy } from 'lodash';

import { dayjsUTC } from '../../../shared/utils/dayjs';
import getPlayerName from '../../../shared/utils/getPlayerName';
import { getPlayerId } from '../../../shared/utils/namesHelper/getId';
import getEntities from '../../parsing/getEntities';
import getPlayerNameAtEndOfTheYear from '../utils/getPlayerNameAtEndOfTheYear';
import limitAndOrder from '../utils/limitAndOrder';

const allowedClasses: RawVehicleClass[] = ['plane', 'heli'];
const minHeight = 1000;

export const sortMostHeight = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostHeightHeli: limitAndOrder(statistics.mostHeightHeli, ['height', 'vehicleName'], ['desc', 'desc']),
  mostHeightPlane: limitAndOrder(statistics.mostHeightPlane, ['height', 'vehicleName'], ['desc', 'desc']),
});

const mostHeight = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const nomineesForHeliById = keyBy(result.mostHeightHeli, 'playedId') as NomineeList<MostHeight>;
  const nomineesForPlaneById = keyBy(result.mostHeightPlane, 'playedId') as NomineeList<MostHeight>;
  const { players, vehicles } = getEntities(replayInfo);
  const vehiclesId = Object.values(vehicles).map((val) => val.id);

  replayInfo.entities.forEach((entity) => {
    if (entity.type === 'unit') return;

    const {
      id: entityId, name: vehicleName, positions, class: vehicleClass,
    } = entity;
    const vehicleId = vehiclesId.find((id) => id === entityId);

    if (
      !allowedClasses.includes(vehicleClass)
      || vehicleId === undefined
      || vehicleId < 0
    ) return;

    const maxHeight: MostHeight = {
      playedId: 'none', playerName: 'unknown', vehicleName, height: 0,
    };

    positions.forEach((position) => {
      const pos = position[0];

      if (!pos) return;

      const height = pos[2];

      if (height > maxHeight.height) {
        const playersInside = position[3];
        const apparentlyDriverId = playersInside[0];
        const playerInfo = players[apparentlyDriverId];

        if (!playerInfo || playersInside.length === 0) return;

        maxHeight.height = height;

        const entityName = getPlayerName(playerInfo.name)[0];
        const playerId = getPlayerId(entityName, dayjsUTC(other.replay.date));
        const playerName = getPlayerNameAtEndOfTheYear(playerId) ?? entityName;

        maxHeight.playedId = playerId;
        maxHeight.playerName = playerName;
      }
    });

    if (maxHeight.height >= minHeight) {
      const { playedId, height } = maxHeight;

      if (vehicleClass === 'heli') {
        const nominee = nomineesForHeliById[playedId] as MostHeight | undefined;

        if (!nominee || (height > nominee.height)) nomineesForHeliById[playedId] = maxHeight;
      }

      if (vehicleClass === 'plane') {
        const nominee = nomineesForPlaneById[playedId] as MostHeight | undefined;

        if (!nominee || (height > nominee.height)) nomineesForPlaneById[playedId] = maxHeight;
      }
    }
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostHeightHeli: Object.values(nomineesForHeliById),
      mostHeightPlane: Object.values(nomineesForPlaneById),
    },
  };
};

export default mostHeight;
