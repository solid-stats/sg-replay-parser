import { round } from 'lodash';

const calculateVehicleKillsCoef = (
  kills: GlobalPlayerStatistics['kills'],
  killsFromVehicle: GlobalPlayerStatistics['killsFromVehicle'],
): GlobalPlayerStatistics['killsFromVehicleCoef'] => {
  if (!killsFromVehicle) return 0;

  if (!kills) return 0;

  return round(killsFromVehicle / kills, 2);
};

export default calculateVehicleKillsCoef;
