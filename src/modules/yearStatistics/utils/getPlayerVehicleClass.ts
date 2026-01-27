import { flyingVehicle } from './consts';

const getPlayerVehicleClass = (
  vehiclesId: number[],
  replayInfo: ReplayInfo,
  frame: number,
  playerId: number,
): RawVehicleClass | null => {
  let result: RawVehicleClass | null = null;

  vehiclesId.forEach((vehicleId) => {
    const vehicleEntity = replayInfo.entities[vehicleId] as VehicleEntity;
    const vehiclePosition = vehicleEntity.positions[frame];

    if (!vehiclePosition) return;

    const playersInside = vehiclePosition[3];

    if (playersInside.includes(playerId)) {
      const vehicleClass = vehicleEntity.class;

      const pos = vehiclePosition[0];

      if (!pos) return;

      if (flyingVehicle.includes(vehicleClass) && pos[2] <= 0) return;

      result = vehicleClass;
    }
  });

  return result;
};

export default getPlayerVehicleClass;
