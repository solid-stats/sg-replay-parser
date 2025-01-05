import { keyBy, uniq } from 'lodash';

import { dayjsUTC } from '../../../0 - utils/dayjs';
import getPlayerName from '../../../0 - utils/getPlayerName';
import { getPlayerId } from '../../../0 - utils/namesHelper/getId';
import { forbiddenWeapons } from '../../../0 - utils/weaponsStatistic';
import getEntities from '../../../2 - parseReplayInfo/getEntities';
import getPlayerNameAtEndOfTheYear from '../../utils/getPlayerNameAtEndOfTheYear';
import limitAndOrder from '../../utils/limitAndOrder';
import oldWeapons from './oldWeapons';

export const sortMostKillsFromOldWeapons = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  // USED ONLY WHEN PREPARING OLD WEAPONS LIST
  // mostKillsFromOldWeapons: limitAndOrder(
  //   statistics.mostKillsFromOldWeapons,
  //   'count',
  //   'desc',
  //   999999,
  // ),
  mostKillsFromOldWeapons: limitAndOrder(statistics.mostKillsFromOldWeapons, 'count', 'desc'),
});

const mostKillsFromOldWeapons = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const mostKillsFromOldWeaponsNomineesById = keyBy(result.mostKillsFromOldWeapons, 'id') as NomineeList<MostKillsFromOldWeapons>;

  const { players, vehicles } = getEntities(replayInfo);
  const vehiclesName = uniq(Object.values(vehicles).map((vehicle) => vehicle.name.toLowerCase()));

  replayInfo.events.forEach((event) => {
    const eventType = event[1];

    if (eventType !== 'killed') return;

    const killedId = event[2];
    const killed = players[killedId];

    if (!killed) return;

    const killInfo = event[3];

    if (killInfo[0] === 'null' || !killInfo[1]) return;

    const [killerId, weaponName] = killInfo;
    const loweredWeaponName = weaponName.toLowerCase();
    const killer = players[killerId];

    if (!killer || killer.id === killedId) return;

    if (vehiclesName.includes(loweredWeaponName)) return;

    if (forbiddenWeapons.includes(loweredWeaponName)) return;

    // THIS BLOCK USED ONLY WHEN PREPARING OLD WEAPONS LIST
    // const id = loweredWeaponName;
    // const name = loweredWeaponName;

    // const emptyNominee: MostKillsFromOldWeapons = {
    //   id,
    //   name,
    //   count: 0,
    //   weapons: {},
    // };
    // const oldWeaponsCurrentNominee = mostKillsFromOldWeaponsNomineesById[id] || emptyNominee;

    // mostKillsFromOldWeaponsNomineesById[loweredWeaponName] = {
    //   id,
    //   name,
    //   count: oldWeaponsCurrentNominee.count + 1,
    //   weapons: {},
    // };
    // THIS BLOCK USED ONLY WHEN PREPARING OLD WEAPONS LIST

    if (oldWeapons.find((weapon) => loweredWeaponName === weapon)) {
      const entityName = getPlayerName(killer.name)[0];
      const id = getPlayerId(entityName, dayjsUTC(other.replay.date));
      const name = getPlayerNameAtEndOfTheYear(id) ?? entityName;

      const emptyNominee: MostKillsFromOldWeapons = {
        id,
        name,
        count: 0,
        weapons: {},
      };
      const oldWeaponsCurrentNominee = mostKillsFromOldWeaponsNomineesById[id] || emptyNominee;

      const currentWeaponStats = oldWeaponsCurrentNominee.weapons?.[weaponName];

      mostKillsFromOldWeaponsNomineesById[id] = {
        id,
        name,
        count: oldWeaponsCurrentNominee.count + 1,
        weapons: {
          ...oldWeaponsCurrentNominee.weapons,
          [weaponName]: (currentWeaponStats ?? 0) + 1,
        },
      };
    }
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostKillsFromOldWeapons: Object.values(mostKillsFromOldWeaponsNomineesById),
    },
  };
};

export default mostKillsFromOldWeapons;
