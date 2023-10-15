import { keyBy, max, uniq } from 'lodash';

import getPlayerName from '../../0 - utils/getPlayerName';
import { forbiddenWeapons } from '../../0 - utils/weaponsStatistic';
import getEntities from '../../2 - parseReplayInfo/getEntities';
import limitAndOrder from '../utils/limitAndOrder';

const atWeapons = ['m136', 'rpg', 'fgm', 'm72', 'smaw', 'maaws', 'panzerfaust', 'rshg', 'apilas'];

export const sortMostATKills = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostATKills: limitAndOrder(
    statistics.mostATKills,
    ['total', 'vehiclesKilled', 'playersKilled', 'maxDistance'],
    ['desc', 'desc', 'desc', 'desc'],
  ),
});

const mostATKills = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const nomineesByName = keyBy(result.mostATKills, 'playerName') as NomineeList<MostATKills>;
  const { players, vehicles } = getEntities(replayInfo);
  const vehiclesName = uniq(Object.values(vehicles).map((vehicle) => vehicle.name.toLowerCase()));

  replayInfo.events.forEach((event) => {
    const eventType = event[1];

    if (eventType !== 'killed') return;

    // eslint-disable-next-line array-element-newline
    const [, , killedId, killInfo, distance] = event;

    if (killInfo[0] === 'null' || !killInfo[1]) return;

    const [killerId, weaponName] = killInfo;
    const killer = players[killerId];
    const killedPlayer = players[killedId];
    const killedVehicle = vehicles[killedId];

    if (
      !killer
      || (!killedPlayer && !killedVehicle)
      || forbiddenWeapons.includes(weaponName.toLowerCase())
      || vehiclesName.includes(weaponName.toLowerCase())
    ) return;

    const playerName = getPlayerName(killer.name)[0];

    if (!atWeapons.some((weapon) => weaponName.toLowerCase().includes(weapon))) return;

    const currentNominee: MostATKills = nomineesByName[playerName] || {
      playerName, maxDistance: distance, playersKilled: 0, vehiclesKilled: 0, total: 0,
    };

    nomineesByName[playerName] = {
      playerName,
      maxDistance: max([currentNominee.maxDistance, distance]) || distance,
      playersKilled: killedPlayer
        ? currentNominee.playersKilled + 1
        : currentNominee.playersKilled,
      vehiclesKilled: killedVehicle
        ? currentNominee.vehiclesKilled + 1
        : currentNominee.vehiclesKilled,
      total: currentNominee.total + 1,
    };
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostATKills: Object.values(nomineesByName),
    },
  };
};

export default mostATKills;
