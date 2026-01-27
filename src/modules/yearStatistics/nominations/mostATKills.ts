import { keyBy, max, uniq } from 'lodash';

import { dayjsUTC } from '../../../shared/utils/dayjs';
import getPlayerName from '../../../shared/utils/getPlayerName';
import { getPlayerId } from '../../../shared/utils/namesHelper/getId';
import { forbiddenWeapons } from '../../../shared/utils/weaponsStatistic';
import getEntities from '../../parsing/getEntities';
import getPlayerNameAtEndOfTheYear from '../utils/getPlayerNameAtEndOfTheYear';
import limitAndOrder from '../utils/limitAndOrder';

const atWeapons = ['m136', 'rpg', 'fgm', 'm72', 'smaw', 'maaws', 'panzerfaust', 'bunkerfaust', 'rshg', 'apilas', 'psrl', 'rgw', 'nlaw', 'rbr-m80'];

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
  const nomineesById = keyBy(result.mostATKills, 'playerId') as NomineeList<MostATKills>;
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

    const entityName = getPlayerName(killer.name)[0];
    const playerId = getPlayerId(entityName, dayjsUTC(other.replay.date));
    const name = getPlayerNameAtEndOfTheYear(playerId) ?? entityName;

    if (!atWeapons.some((weapon) => weaponName.toLowerCase().includes(weapon))) return;

    const currentNominee: MostATKills = nomineesById[playerId] || {
      playerId,
      playerName: name,
      maxDistance: distance,
      playersKilled: 0,
      vehiclesKilled: 0,
      total: 0,
    };

    nomineesById[playerId] = {
      playerId,
      playerName: name,
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
      mostATKills: Object.values(nomineesById),
    },
  };
};

export default mostATKills;
