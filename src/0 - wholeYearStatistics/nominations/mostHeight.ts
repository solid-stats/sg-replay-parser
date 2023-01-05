import getPlayerName from '../../0 - utils/getPlayerName';
import getEntities from '../../2 - parseReplayInfo/getEntities';
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
  const nomineesForPlane = [...result.mostHeightPlane];
  const nomineesForHeli = [...result.mostHeightHeli];
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

    const maxHeight: MostHeight = { playerName: 'unknown', vehicleName, height: 0 };

    positions.forEach((position) => {
      const height = position[0][2];

      if (height > maxHeight.height) {
        maxHeight.height = height;

        const playersInside = position[3];
        const apparentlyDriverId = playersInside[0];
        const playerInfo = players[apparentlyDriverId];

        if (!playerInfo || playersInside.length === 0) {
          maxHeight.playerName = 'unknown';

          return;
        }

        const playerName = getPlayerName(playerInfo.name)[0];

        maxHeight.playerName = playerName;
      }
    });

    if (maxHeight.height >= minHeight) {
      if (vehicleClass === 'heli') nomineesForHeli.push(maxHeight);

      if (vehicleClass === 'plane') nomineesForPlane.push(maxHeight);
    }
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostHeightHeli: nomineesForHeli,
      mostHeightPlane: nomineesForPlane,
    },
  };
};

export default mostHeight;
