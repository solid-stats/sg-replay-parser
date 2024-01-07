import { keyBy, uniq } from 'lodash';

import { forbiddenWeapons } from '../../0 - utils/weaponsStatistic';
import getEntities from '../../2 - parseReplayInfo/getEntities';
import limitAndOrder from '../utils/limitAndOrder';

export const sortBestWeaponsAndVehicles = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  bestVehicle: limitAndOrder(statistics.bestVehicle, 'count', 'desc'),
  bestWeapon: limitAndOrder(statistics.bestWeapon, 'count', 'desc'),
});

const bestWeaponsAndVehicles = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const vehicleNomineesByName = keyBy(result.bestVehicle, 'name') as NomineeList<DefaultCountNomination>;
  const weaponNomineesByName = keyBy(result.bestWeapon, 'name') as NomineeList<DefaultCountNomination>;

  const { players, vehicles } = getEntities(replayInfo);
  const vehiclesName = uniq(Object.values(vehicles).map((vehicle) => vehicle.name.toLowerCase()));

  replayInfo.events.forEach((event) => {
    const eventType = event[1];

    if (eventType !== 'killed') return;

    const killInfo = event[3];

    if (killInfo[0] === 'null' || !killInfo[1]) return;

    const [killerId, weaponName] = killInfo;
    const loweredWeaponName = weaponName.toLowerCase();
    const killer = players[killerId];

    if (!killer) return;

    if (vehiclesName.includes(loweredWeaponName)) {
      const currentNominee: DefaultCountNomination = vehicleNomineesByName[weaponName] || {
        id: weaponName,
        name: weaponName,
        count: 0,
      };

      vehicleNomineesByName[weaponName] = {
        id: weaponName,
        name: weaponName,
        count: currentNominee.count + 1,
      };

      return;
    }

    if (forbiddenWeapons.includes(loweredWeaponName)) return;

    const currentNominee: DefaultCountNomination = weaponNomineesByName[weaponName] || {
      id: weaponName,
      name: weaponName,
      count: 0,
    };

    weaponNomineesByName[weaponName] = {
      id: weaponName,
      name: weaponName,
      count: currentNominee.count + 1,
    };
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      bestVehicle: Object.values(vehicleNomineesByName),
      bestWeapon: Object.values(weaponNomineesByName),
    },
  };
};

export default bestWeaponsAndVehicles;
