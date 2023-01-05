import { keyBy, uniq } from 'lodash';

import getPlayerName from '../../0 - utils/getPlayerName';
import { forbiddenWeapons } from '../../0 - utils/weaponsStatistic';
import getEntities from '../../2 - parseReplayInfo/getEntities';
import { secondsInFrame } from '../utils/consts';
import formatTime from '../utils/formatTime';
import limitAndOrder from '../utils/limitAndOrder';

// Mostly AT or MANPAD weapons
const ignoredWeapons = ['fim-92a', 'fim-92f', '9k32m strela-2m', 'fgm-148 javelin', '9k38 igla'];

export const sortMostDistantKill = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostDistantKill: limitAndOrder(statistics.mostDistantKill, 'maxDistance', 'desc'),
});

const mostDistantKill = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const nomineesByWeaponName = keyBy(result.mostDistantKill, 'weaponName') as NomineeList<MostDistantKill>;
  const { players, vehicles } = getEntities(replayInfo);
  const vehiclesName = uniq(Object.values(vehicles).map((vehicle) => vehicle.name.toLowerCase()));

  replayInfo.events.forEach((event) => {
    const eventType = event[1];

    if (eventType !== 'killed') return;

    // eslint-disable-next-line array-element-newline
    const [frame, , , killInfo, distance] = event;

    if (killInfo[0] === 'null' || !killInfo[1]) return;

    const [killerId, weaponName] = killInfo;
    const killer = players[killerId];
    const killerEntity = replayInfo.entities[killerId];

    if (
      vehiclesName.includes(weaponName.toLowerCase())
      || forbiddenWeapons.includes(weaponName.toLowerCase())
      || ignoredWeapons.includes(weaponName.toLowerCase())
      || !killer
      || killerEntity.type === 'vehicle'
    ) return;

    const playerName = getPlayerName(killer.name)[0];
    const roleDescription = killerEntity.description.toLowerCase();
    const replayLink = `https://solidgames.ru${other.replay.replayLink}`;

    if (
      roleDescription.includes('mortar')
      || roleDescription.includes('миномет')
      || roleDescription.includes('миномёт')
      || roleDescription.includes('mortier')
    ) return;

    const currentNominee: MostDistantKill = nomineesByWeaponName[weaponName] || {
      playerName, weaponName, maxDistance: 0, roleDescription, replayLink,
    };

    if (currentNominee.maxDistance < distance && distance <= 3500) {
      nomineesByWeaponName[weaponName] = {
        playerName,
        weaponName,
        maxDistance: distance,
        roleDescription,
        replayLink,
        replayTime: formatTime(frame * secondsInFrame),
      };
    }
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostDistantKill: Object.values(nomineesByWeaponName),
    },
  };
};

export default mostDistantKill;
